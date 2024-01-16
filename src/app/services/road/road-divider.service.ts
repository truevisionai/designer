import { Injectable } from '@angular/core';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadService } from './road.service';
import { TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { SplineSegmentService } from '../spline/spline-segment.service';
import { SplineService } from '../spline/spline.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadDividerService {

	constructor (
		private roadService: RoadService,
		private segmentService: SplineSegmentService,
		private splineService: SplineService,
	) {
	}

	divideRoadAt ( road: TvRoad, s: number ) {

		const newRoad = this.roadService.clone( road, s );

		road.setSuccessorRoad( newRoad, TvContactPoint.START );

		newRoad.setPredecessorRoad( road, TvContactPoint.END );

		newRoad.sStart = road.sStart + s;

		this.segmentService.addRoadSegmentNew( road.spline, newRoad.sStart, newRoad );

		this.splineService.updateSpline( road.spline );

		return newRoad

	}

	cutRoadFromTo ( road: TvRoad, sStart: number, sEnd: number ): TvRoad {

		// TODO: Not used and might need fixes

		this.segmentService.addEmptySegment( road.spline, road.sStart + sStart );

		if ( sEnd > road.length ) return;

		const newRoad = this.roadService.clone( road, sEnd );

		newRoad.sStart = road.sStart + sEnd;

		this.segmentService.addRoadSegmentNew( road.spline, newRoad.sStart, newRoad );

		// update links

		if ( road.successor?.isRoad ) {

			const successor = road.successor.getElement<TvRoad>();

			successor.setPredecessorRoad( newRoad, TvContactPoint.END );

			newRoad.successor = road.successor;

			// TODO: this will be junction and not null
			road.successor = null;

		}

		this.splineService.updateSpline( road.spline );

		newRoad.predecessor = null;

		return newRoad;

	}
}
