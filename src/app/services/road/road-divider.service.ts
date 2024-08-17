/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadService } from './road.service';
import { TvContactPoint } from 'app/map/models/tv-common';
import { SplineService } from '../spline/spline.service';
import { RoadLinkService } from "./road-link.service";
import { RoadManager } from "../../managers/road/road-manager";
import { MapService } from "../map/map.service";
import { SplineUtils } from "../../utils/spline.utils";
import { SplineSegmentService } from '../spline/spline-segment.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadDividerService {

	constructor (
		private mapService: MapService,
		private roadManager: RoadManager,
		private roadService: RoadService,
		private splineService: SplineService,
		private linkService: RoadLinkService,
		private segmentService: SplineSegmentService,
	) {
	}

	divideRoadAt ( road: TvRoad, s: number ) {

		const newRoad = this.roadService.divideRoad( road, s );

		this.segmentService.addSegment( road.spline, road.sStart + s, newRoad );

		return newRoad

	}

	cutRoadFromTo ( road: TvRoad, sStart: number, sEnd: number ): TvRoad {

		// TODO: Not used and might need fixes

		SplineUtils.addSegment( road.spline, road.sStart + sStart, null );

		if ( sEnd > road.length ) return;

		const newRoad = this.roadService.clone( road, sEnd );

		newRoad.sStart = road.sStart + sEnd;

		SplineUtils.addSegment( road.spline, newRoad.sStart, newRoad );

		// update links

		if ( road.successor?.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			successor.setPredecessorRoad( newRoad, TvContactPoint.END );

			newRoad.successor = road.successor;

			// TODO: this will be junction and not null
			road.successor = null;

		}

		this.splineService.update( road.spline );

		newRoad.predecessor = null;

		return newRoad;

	}

}
