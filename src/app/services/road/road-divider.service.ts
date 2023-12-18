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

		return this.roadService.divideRoadAt( road, s );

	}

	// cutRoadFromTo ( road: TvRoad, start: number, end: number ): TvRoad[] {

	// 	return this.roadService.cutRoadFromTo( road, start, end );

	// }
}
