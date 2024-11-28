/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvContactPoint } from "app/map/models/tv-common";
import { TvMap } from "app/map/models/tv-map.model";
import { TvLink } from "app/map/models/tv-link";
import { TvRoad } from "app/map/models/tv-road.model";
import { Maths } from "../../utils/maths";
import { Log } from "../../core/utils/log";
import { MapEvents } from "app/events/map-events";
import { SplineUpdatedEvent } from "app/events/spline/spline-updated-event";

@Injectable( {
	providedIn: 'root'
} )
export class MapFixer {

	// disabling as it is creating issues
	private enabled = false;

	fixMap ( map: TvMap ) {

		if ( !this.enabled ) return;

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

	private fixRoad ( road: TvRoad ) {

		if ( road.successor ) {

			this.fixSuccessor( road, road.successor );

		}

		if ( road.predecessor ) {

			this.fixPredecessor( road, road.predecessor );

		}

	}

	private fixSuccessor ( predecessor: TvRoad, link: TvLink ) {

		if ( link.isJunction ) {

			const junction = link.element as TvJunction

			const connections = junction.getConnections().filter( connection => connection.incomingRoad === predecessor );

			if ( connections.length == 0 ) {

				Log.warn( 'No Connections With Junction', predecessor.toString(), link.toString() );

				predecessor.successor = null;

				Log.warn( 'Trying to fix road', predecessor.toString() );

				setTimeout( () => {

					// Trigger auto update
					MapEvents.splineUpdated.emit( new SplineUpdatedEvent( predecessor.spline ) );

				}, 1000 + Math.random() * 1000 );

			}

			return;
		}

		const successor = link.element as TvRoad;

		if ( !successor.predecessor || successor.predecessor.element !== predecessor ) {

			const [ successorContact, predecessorContact ] = this.findContacts( successor, predecessor );

			Log.warn( `Fixed successor road ${ successor.id } for road ${ predecessor.id }` );

			Log.warn( 'fixing successor', this.findContacts( successor, predecessor ) );

			// if ( successorContact === TvContactPoint.END ) {
			//
			// 	successor.setPredecessorRoad( predecessor, TvContactPoint.START );
			//
			// } else if ( successorContact === TvContactPoint.START ) {
			//
			// 	successor.setPredecessorRoad( predecessor, TvContactPoint.END );
			//
			// }

		}

	}

	private fixPredecessor ( successor: TvRoad, link: TvLink ) {

		if ( link.isJunction ) {

			const junction = link.element as TvJunction

			const connections = junction.getConnections().filter( connection => connection.incomingRoad === successor );

			if ( connections.length == 0 ) {

				Log.warn( 'No Connections With Junction', successor.toString(), link.toString() );

				successor.predecessor = null

				Log.warn( 'Trying to fix road', successor.toString() );

				setTimeout( () => {

					// Trigger auto update
					MapEvents.splineUpdated.emit( new SplineUpdatedEvent( successor.spline ) );

				}, 1000 + Math.random() * 1000 );

			}

			return;
		}

		const predecessor = link.element as TvRoad;

		if ( !predecessor.successor || predecessor.successor.element !== successor ) {

			const [ successorContact, predecessorContact ] = this.findContacts( successor, predecessor );

			Log.warn( `Fixed predecessor road ${ predecessor.id } for road ${ successor.id }` );

			Log.warn( 'fixing predecessor', this.findContacts( successor, predecessor ) );

			// if ( predecessorContact === TvContactPoint.END ) {
			//
			// 	predecessor.setSuccessorRoad( successor, TvContactPoint.START );
			//
			// } else if ( predecessorContact === TvContactPoint.START ) {
			//
			// 	predecessor.setSuccessorRoad( successor, TvContactPoint.END );
			//
			// }

		}

	}

	private fixConnectingRoad ( road: TvRoad ) {

		// this.checkIfJunctionExists( road.junction );

	}

	private fixJunction ( junction: TvJunction ) {


	}

	private findContacts ( a: TvRoad, b: TvRoad ): TvContactPoint[] {

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

		Log.error( 'Roads are not connected', a.toString(), b.toString() );

		return [ null, null ];
	}

}
