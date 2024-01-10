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
import { RoadManager } from "./road-manager";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	constructor (
		private junctionService: JunctionService,
		private mapService: MapService,
		private roadSplineService: RoadSplineService,
		private roadLinkService: RoadLinkService,
		private roadFactory: RoadFactory,
		private roadManager: RoadManager,
	) {
	}

	removeJunction ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			this.roadManager.removeRoad( connection.connectingRoad );

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

			spline.removeSegment( junction );

			this.roadSplineService.rebuildSpline( spline );
		}
	}



}
