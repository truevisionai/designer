import { Injectable } from "@angular/core";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvJunction } from "app/modules/tv-map/models/junctions/tv-junction";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadService } from "app/services/road/road.service";
import { SplineService } from "app/services/spline/spline.service";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	constructor (
		private splineService: SplineService,
		private roadLinkService: RoadLinkService,
		private roadService: RoadService,
		private roadFactory: RoadFactory,
	) {
	}

	addJunction ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.roadService.addRoad( connection.connectingRoad );

		}

	}

	removeJunction ( junction: TvJunction ) {

		this.removeJunctionNextSegment( junction );

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.roadService.removeRoad( connection.connectingRoad );

		}

	}

	removeJunctionNextSegment ( junction: TvJunction ) {

		const splines = junction.getIncomingSplines();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const previousSegment = spline.getPreviousSegment( junction );

			const nextSegment = spline.getNextSegment( junction );

			if ( nextSegment && nextSegment.isRoad && spline.segmentCount > 2 ) {

				const nextRoad = nextSegment.getInstance<TvRoad>();

				this.roadService.removeRoad( nextRoad );

				// this.mapService.map.removeRoad( nextRoad );

				// this.mapService.map.gameObject.remove( nextRoad.gameObject );

				this.roadFactory.idRemoved( nextRoad.id );

				// spline.removeSegment( nextRoad );

				this.roadLinkService.updateSuccessorRelation( nextRoad, previousSegment, nextRoad.successor );

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

			if ( spline.findSegment( junction ) ) {

				spline.removeSegment( junction );

			}

			this.splineService.updateSpline( spline );
		}
	}



}
