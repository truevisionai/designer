import { Injectable } from "@angular/core";
import { TvConsole } from "app/core/utils/console";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvMap } from "app/map/models/tv-map.model";
import { TvRoadLink } from "app/map/models/tv-road-link";
import { TvRoad } from "app/map/models/tv-road.model";
import { Maths } from "../../utils/maths";

@Injectable( {
	providedIn: 'root'
} )
export class MapFixer {

	fixMap ( map: TvMap ) {

		map.getRoads().forEach( road => {

			if ( road.isJunction ) {

				this.fixConnectingRoad( road );

			} else {

				this.fixRoad( road );

			}

		} );

		map.getJunctions().forEach( junction => {

			this.fixJunction( junction );

		} );

	}

	fixRoad ( road: TvRoad ) {

		if ( road.successor ) {

			this.fixSuccessor( road, road.successor );

		}

		if ( road.predecessor ) {

			this.fixPredecessor( road, road.predecessor );

		}

	}

	fixSuccessor ( predecessor: TvRoad, link: TvRoadLink ) {

		if ( link.isJunction ) return;

		const successor = link.element as TvRoad;

		if ( !successor.predecessor || successor.predecessor.element !== predecessor ) {

			const [ successorContact, predecessorContact ] = this.findContacts( successor, predecessor );

			TvConsole.warn( `Fixed successor road ${ successor.id } for road ${ predecessor.id }` );

			console.log( 'fixing successor', this.findContacts( successor, predecessor ) );

			if ( successorContact === TvContactPoint.END ) {

				successor.setPredecessorRoad( predecessor, TvContactPoint.START );

			} else if ( successorContact === TvContactPoint.START ) {

				successor.setPredecessorRoad( predecessor, TvContactPoint.END );

			}

		}

	}

	fixPredecessor ( successor: TvRoad, link: TvRoadLink ) {

		if ( link.isJunction ) return;

		const predecessor = link.element as TvRoad;

		if ( !predecessor.successor || predecessor.successor.element !== successor ) {

			const [ successorContact, predecessorContact ] = this.findContacts( successor, predecessor );

			TvConsole.warn( `Fixed predecessor road ${ predecessor.id } for road ${ successor.id }` );

			console.log( 'fixing predecessor', this.findContacts( successor, predecessor ) );

			if ( predecessorContact === TvContactPoint.END ) {

				predecessor.setSuccessorRoad( successor, TvContactPoint.START );

			} else if ( predecessorContact === TvContactPoint.START ) {

				predecessor.setSuccessorRoad( successor, TvContactPoint.END );

			}

		}

	}

	fixConnectingRoad ( road: TvRoad ) {

		// this.checkIfJunctionExists( road.junction );

	}

	fixJunction ( junction: TvJunction ) {


	}

	findContacts ( a: TvRoad, b: TvRoad ): TvContactPoint[] {

		const aStart = a.getStartPosTheta();
		const aEnd = a.getEndPosTheta();

		const bStart = b.getStartPosTheta();
		const bEnd = b.getEndPosTheta();

		if ( Maths.approxEquals( aStart.distanceTo( bStart ), 0 ) ) {
			return [ TvContactPoint.START, TvContactPoint.START ];
		}

		if ( Maths.approxEquals( aStart.distanceTo( bEnd ), 0 ) ) {
			return [ TvContactPoint.START, TvContactPoint.END ];
		}

		if ( Maths.approxEquals( aEnd.distanceTo( bStart ), 0 ) ) {
			return [ TvContactPoint.END, TvContactPoint.START ];
		}

		if ( Maths.approxEquals( aEnd.distanceTo( bEnd ), 0 ) ) {
			return [ TvContactPoint.END, TvContactPoint.END ];
		}

		console.error( 'Roads are not connected' );

		return [ null, null ];
	}


}
