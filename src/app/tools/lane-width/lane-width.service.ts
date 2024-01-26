/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvLaneWidth } from 'app/map/models/tv-lane-width';
import { TvUtils } from 'app/map/models/tv-utils';
import { LaneService } from 'app/services/lane/lane.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthService {

	constructor ( private laneService: LaneService ) { }

	addLaneWidth ( laneSection: TvLaneSection, lane: TvLane, laneWidth: TvLaneWidth ) {

		lane.addWidthRecordInstance( laneWidth );

		TvUtils.computeCoefficients( lane.width, laneSection.length );

		this.laneService.updateLane( lane );
	}

	removeLaneWidth ( laneSection: TvLaneSection, lane: TvLane, laneWidth: TvLaneWidth ) {

		lane.removeWidthRecordInstance( laneWidth );

		TvUtils.computeCoefficients( lane.width, laneSection.length );

		this.laneService.updateLane( lane );
	}

	updateLaneWidth ( laneSection: TvLaneSection, lane: TvLane, laneWidth: TvLaneWidth ) {

		TvUtils.computeCoefficients( lane.width, laneSection.length );

		this.laneService.updateLane( lane );

	}

}
