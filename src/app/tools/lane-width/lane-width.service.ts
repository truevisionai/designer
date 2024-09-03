/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ValidationException } from 'app/exceptions/exceptions';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneWidth } from 'app/map/models/tv-lane-width';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvUtils } from 'app/map/models/tv-utils';
import { LaneService } from 'app/services/lane/lane.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthService {

	constructor (
		private laneService: LaneService
	) {
	}

	addLaneWidth ( laneSection: TvLaneSection, lane: TvLane, laneWidth: TvLaneWidth ): void {

		lane.addWidthRecordInstance( laneWidth );

		this.updateCoefficients( lane );

		this.laneService.updateLane( lane );
	}

	removeLaneWidth ( laneSection: TvLaneSection, lane: TvLane, laneWidth: TvLaneWidth ): void {

		lane.removeWidthRecordInstance( laneWidth );

		this.updateCoefficients( lane );

		this.laneService.updateLane( lane );
	}

	updateLaneWidth ( laneSection: TvLaneSection, lane: TvLane, laneWidth: TvLaneWidth ): void {

		this.updateCoefficients( lane );

		this.laneService.updateLane( lane );

	}

	updateCoefficients ( lane: TvLane ): void {

		TvUtils.computeCoefficients( lane.width, lane.laneSection.getLength() );

	}

	validateLaneWidth ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, width: TvLaneWidth ): void {

		if ( width.s < 0 ) {
			width.s = 10;
			throw new ValidationException( 'S cannot be negative' );
		}

		if ( width.s > laneSection.endS ) {
			width.s = laneSection.endS;
			throw new ValidationException( 'S cannot be greater than lane section end s' );
		}

	}

}
