/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { MapService } from "app/services/map/map.service";
import { RoadLinkService } from "app/services/road/road-link.service";
import { SplineBuilder } from "app/services/spline/spline.builder";
import { RoadManager } from "./road/road-manager";
import { RoadService } from "app/services/road/road.service";
import { RoadFactory } from "app/factories/road-factory.service";
import { JunctionFactory } from "app/factories/junction.factory";
import { SplineSegmentService } from "../services/spline/spline-segment.service";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionManager {

	constructor (
		private roadLinkService: RoadLinkService,
		private mapService: MapService,
		private roadManager: RoadManager,
		private splineBuilder: SplineBuilder,
		private roadService: RoadService,
		private roadFactory: RoadFactory,
		private junctionFactory: JunctionFactory,
		private segmentService: SplineSegmentService,
	) {
	}

	addJunction ( junction: TvJunction ) {

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			// TODO: use road manager
			this.roadService.add( connection.connectingRoad );

		}

	}

	removeJunction ( junction: TvJunction ) {

		this.removeJunctionNextSegment( junction );

		const connections = junction.getConnections();

		for ( const connection of connections ) {

			// TODO: use road manager
			this.roadService.remove( connection.connectingRoad );

		}

		this.junctionFactory.IDService.remove( junction.id );
	}

	removeJunctionNextSegment ( junction: TvJunction ) {

		const splines = junction.getIncomingSplines();

		for ( let i = 0; i < splines.length; i++ ) {

			const spline = splines[ i ];

			const previousSegment = spline.getPreviousSegment( junction );

			const nextSegment = spline.getNextSegment( junction );

			if ( nextSegment && nextSegment.isRoad && spline.segmentCount > 2 ) {

				const nextRoad = nextSegment.getInstance<TvRoad>();

				this.roadManager.removeRoad( nextRoad );

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

				this.segmentService.removeJunctionSegment( spline, junction );

			}

			this.splineBuilder.buildSpline( spline );
		}
	}

}
