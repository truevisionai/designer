import { Injectable } from '@angular/core';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadService } from './road.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadDividerService {

	constructor (
		private roadService: RoadService
	) {
	}

	divideRoadAt ( road: TvRoad, s: number ) {

		const clone = road.clone( s );

		clone.id = this.roadService.getNextRoadId();

		clone.sStart = road.sStart + s;

		return clone

	}

	cutRoadFromTo ( road: TvRoad, start: number, end: number ): TvRoad[] {

		if ( start > end ) throw new Error( 'Start must be less than end' );

		const right = road.clone( end );
		right.id = this.roadService.getNextRoadId();
		right.sStart = road.sStart + end;

		// empty section/segment
		road.spline.addRoadSegment( start, -1 );

		return [ road, right ];

	}
}
