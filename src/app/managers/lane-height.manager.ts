import { Injectable } from "@angular/core";
import { TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightManager {

	updateLaneHeight ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

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

}
