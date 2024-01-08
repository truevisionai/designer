import { Injectable } from "@angular/core";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { TvContactPoint } from "app/modules/tv-map/models/tv-common";
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

			// spline of 4-junction-7
			const spline = splines[ i ];

			// 4
			const previousSegment = spline.getPreviousSegment( junction );

			// 7
			const nextSegment = spline.getNextSegment( junction );

			if ( nextSegment && nextSegment.isRoad && spline.segmentCount > 2 ) {

				const nextRoad = nextSegment.getInstance<TvRoad>();

				this.mapService.map.removeRoad( nextRoad );

				this.mapService.map.gameObject.remove( nextRoad.gameObject );

				spline.removeSegment( nextRoad );

				if ( nextRoad.successor && previousSegment.isRoad ) {

					const previousRoad = previousSegment.getInstance<TvRoad>();

					previousRoad.successor = nextRoad.successor;

					if ( previousRoad.successor && previousRoad.successor.isRoad ) {

						const successorRoad = previousRoad.successor.getElement<TvRoad>();

						if ( previousRoad.successor.contactPoint == TvContactPoint.START ) {

							successorRoad.setPredecessorRoad( previousRoad, TvContactPoint.END );

						} else if ( previousRoad.successor.contactPoint == TvContactPoint.END ) {

							successorRoad.setSuccessorRoad( previousRoad, TvContactPoint.END );

						}

					}

				}

			}

			if ( previousSegment && previousSegment.isRoad ) {

				const previousRoad = previousSegment.getInstance<TvRoad>();

				if ( nextSegment && nextSegment.isRoad ) {

					previousRoad.successor = nextSegment.getInstance<TvRoad>().successor;

					if ( previousRoad.successor && previousRoad.successor.isRoad ) {

						if ( previousRoad.successor.contactPoint == TvContactPoint.START ) {

							// road.setPredecessorRoad( road, TvContactPoint.END );

						} else if ( previousRoad.successor.contactPoint == TvContactPoint.END ) {

							// road.setSuccessorRoad( road, TvContactPoint.END );

						}

					}

				} else {

					previousRoad.successor = null;

				}

			}

			spline.removeSegment( junction );

			this.roadSplineService.rebuildSpline( spline );
		}
	}

}
