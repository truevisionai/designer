import { Injectable } from '@angular/core';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvLaneWidth } from 'app/modules/tv-map/models/tv-lane-width';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
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
