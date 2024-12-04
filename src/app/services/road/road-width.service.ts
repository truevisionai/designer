/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvContactPoint } from 'app/map/models/tv-common';
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

	findRoadWidthAt ( road: TvRoad, value: TvContactPoint | number ): { totalWidth: number; leftSideWidth: number; rightSideWidth: number; } {

		let distance: number;

		if ( typeof value === 'number' ) {
			distance = value;
		} else {
			distance = value == TvContactPoint.START ? 0 : road.getLength();
		}

		const laneSection = road.getLaneProfile().getLaneSectionAt( distance );

		const lanes = laneSection.getLanes();

		return {
			totalWidth: this.sumLaneWidth( lanes, distance ),
			leftSideWidth: this.sumLaneWidth( laneSection.getLeftLanes(), distance ),
			rightSideWidth: this.sumLaneWidth( laneSection.getRightLanes(), distance ),
		};
	}

	findTotalWidthAt ( road: TvRoad, s: number ): number {

		const laneSection = road.getLaneProfile().getLaneSectionAt( s );

		const lanes = laneSection.getLanes();

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
