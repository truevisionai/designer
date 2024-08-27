/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLane } from 'app/map/models/tv-lane';
import { TvRoad } from 'app/map/models/tv-road.model';

@Injectable( {
	providedIn: 'root'
} )
export class RoadWidthService {

	private static _instance: RoadWidthService;

	static get instance (): RoadWidthService {
		if ( !RoadWidthService._instance ) {
			RoadWidthService._instance = new RoadWidthService();
		}
		return RoadWidthService._instance;
	}

	findRoadWidthAt ( road: TvRoad, s: number ): { totalWidth: number; leftSideWidth: number; rightSideWidth: number; } {

		const laneSection = road.getLaneProfile().getLaneSectionAt( s );

		const lanes = laneSection.getLaneArray();

		return {
			totalWidth: this.sumLaneWidth( lanes, s ),
			leftSideWidth: this.sumLaneWidth( laneSection.getLeftLanes(), s ),
			rightSideWidth: this.sumLaneWidth( laneSection.getRightLanes(), s ),
		};
	}

	findTotalWidthAt ( road: TvRoad, s: number ): number {

		const laneSection = road.getLaneProfile().getLaneSectionAt( s );

		const lanes = laneSection.getLaneArray();

		return this.sumLaneWidth( lanes, s );
	}

	findLeftWidthAt ( road: TvRoad, s: number ): number {

		const laneSection = road.getLaneProfile().getLaneSectionAt( s );

		const lanes = laneSection.getLeftLanes();

		return this.sumLaneWidth( lanes, s );
	}

	findRightWidthAt ( road: TvRoad, s: number ): number {

		const laneSection = road.getLaneProfile().getLaneSectionAt( s );

		const lanes = laneSection.getRightLanes();

		return this.sumLaneWidth( lanes, s );
	}

	private sumLaneWidth ( lane: TvLane[], s: number ): number {

		let width = 0;

		lane.forEach( lane => width += lane.getWidthValue( s ) );

		return width;

	}

}
