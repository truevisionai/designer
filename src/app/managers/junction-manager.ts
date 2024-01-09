import { Injectable } from "@angular/core";
import { SplineSegment } from "app/core/shapes/spline-segment";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { TvContactPoint } from "app/modules/tv-map/models/tv-common";
import { TvRoadLinkChild } from "app/modules/tv-map/models/tv-road-link-child";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { JunctionService } from "app/services/junction/junction.service";
import { MapService } from "app/services/map.service";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadSplineService } from "app/services/road/road-spline.service";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	constructor (
		private junctionService: JunctionService,
		private mapService: MapService,
		private roadSplineService: RoadSplineService,
		private roadLinkService: RoadLinkService,
		private roadFactory: RoadFactory
	) {
	}

	removeJunction ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.roadLinkService.removeLinks( connection.connectingRoad );

			this.mapService.map.removeRoad( connection.connectingRoad );

			this.mapService.map.gameObject.remove( connection.connectingRoad.gameObject );

			this.mapService.map.removeSpline( connection.connectingRoad.spline );

			this.roadFactory.idRemoved( connection.connectingRoad.id );

		}

		this.removeJunctionNextSegment( junction );

		this.junctionService.removeJunction( junction );

	}

	removeJunctionNextSegment ( junction: TvJunction ) {

		const splines = junction.getIncomingSplines();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const previousSegment = spline.getPreviousSegment( junction );

			const nextSegment = spline.getNextSegment( junction );

			if ( nextSegment && nextSegment.isRoad && spline.segmentCount > 2 ) {

				const nextRoad = nextSegment.getInstance<TvRoad>();

				this.mapService.map.removeRoad( nextRoad );

				this.mapService.map.gameObject.remove( nextRoad.gameObject );

				this.roadFactory.idRemoved( nextRoad.id );

				spline.removeSegment( nextRoad );

				this.updateSuccessorRelation( nextRoad, previousSegment, nextRoad.successor );

			}

			if ( previousSegment && previousSegment.isRoad ) {

				const previousRoad = previousSegment.getInstance<TvRoad>();

				if ( nextSegment && nextSegment.isRoad ) {

					const nextRoad = nextSegment.getInstance<TvRoad>();

					previousRoad.successor = nextRoad.successor;

				} else {

					previousRoad.successor = null;

				}

			}

			spline.removeSegment( junction );

			this.roadSplineService.rebuildSpline( spline );
		}
	}

	updateSuccessorRelation ( roadAfterJunction: TvRoad, previousSegment: SplineSegment, link: TvRoadLinkChild ) {

		if ( !link ) return;

		if ( !roadAfterJunction.successor ) return;

		if ( !previousSegment ) return;

		if ( !previousSegment.isRoad ) return;

		const roadBeforeJunction = previousSegment.getInstance<TvRoad>();

		roadBeforeJunction.setSuccessor( link.elementType, link.element, link.contactPoint );

		if ( link.isJunction ) {

			const junction = link.getElement<TvJunction>();

			// connections where old road was entering junction
			const incomingConnections = junction.getConnections().filter( i => i.incomingRoad == roadAfterJunction );

			// connections where old road was exiting junction
			const outgoingConnections = junction.getConnections().filter( i => i.outgoingRoad == roadAfterJunction );

			for ( let i = 0; i < incomingConnections.length; i++ ) {

				const connection = incomingConnections[ i ];

				connection.incomingRoad = roadBeforeJunction;

				connection.laneLink.forEach( link => {

					link.incomingLane = roadBeforeJunction.laneSections[ 0 ].getLaneById( link.incomingLane.id );

				} );

				connection.connectingRoad.setPredecessorRoad( roadBeforeJunction, TvContactPoint.END );

			}

			for ( let i = 0; i < outgoingConnections.length; i++ ) {

				const connection = outgoingConnections[ i ];

				connection.outgoingRoad = roadBeforeJunction;

				connection.laneLink.forEach( link => {

					// link.connectingLane.

				} );

				connection.connectingRoad.setSuccessorRoad( roadBeforeJunction, TvContactPoint.END );

			}


		} else if ( link.isRoad ) {

			const successorRoad = link.getElement<TvRoad>();

			if ( link.contactPoint == TvContactPoint.START ) {

				successorRoad.setPredecessorRoad( roadBeforeJunction, TvContactPoint.END );

			} else if ( link.contactPoint == TvContactPoint.END ) {

				successorRoad.setSuccessorRoad( roadBeforeJunction, TvContactPoint.END );

			}

		}

	}

}
