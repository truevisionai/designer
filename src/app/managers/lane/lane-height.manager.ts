/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvLaneHeight } from "app/map/lane-height/lane-height.model";
import { TvLaneType } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";
import { LaneUtils } from "app/utils/lane.utils";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightManager {

	onLaneCreated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( lane.type == TvLaneType.sidewalk || lane.type == TvLaneType.curb ) {

			if ( lane.getLaneHeightCount() == 0 ) {

				lane.addHeightRecord( 0, 0.12, 0.12 );

			}

		} else {

			if ( lane.getLaneHeightCount() == 1 && lane.getLaneHeight( 0 ).sOffset == 0 ) {

				lane.clearLaneHeight();

			}

		}

	}


	onLaneUpdated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( lane.height.length == 0 ) {
			return;
		}

		const succcessor = LaneUtils.getSuccessorLane( road, laneSection, lane );

		const predecessor = LaneUtils.getPredecessorLane( road, laneSection, lane );

		const lastHeight = lane.height[ lane.height.length - 1 ];

		if ( succcessor && lastHeight ) {

			this.sync( succcessor, lastHeight );

		}

		if ( predecessor ) {

			this.sync( predecessor, lane.getHeightValue( 0 ) );

		}

	}

	private sync ( otherLane: TvLane, height: TvLaneHeight ) {

		if ( otherLane.height.length == 0 ) {

			otherLane.addHeightRecord( height.sOffset, height.inner, height.outer );

			return;
		}

		const otherLaneHeight = otherLane.height.find( ( h: TvLaneHeight ) => h.sOffset >= height.sOffset );

		if ( otherLaneHeight ) {

			otherLaneHeight.setInner( height.inner );
			otherLaneHeight.setOuter( height.outer );

		}

	}

}
