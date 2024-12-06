/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadService } from './road.service';
import { SplineSegmentService } from '../spline/spline-segment.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadDividerService {

	constructor (
		private roadService: RoadService,
		private segmentService: SplineSegmentService,
	) {
	}

	divideRoadAt ( road: TvRoad, s: number ): TvRoad {

		const newRoad = this.roadService.divideRoad( road, s );

		this.segmentService.addSegment( road.spline, road.sStart + s, newRoad );

		return newRoad

	}

}
