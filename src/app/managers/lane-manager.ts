import { Injectable } from "@angular/core";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { LaneWidthManager } from "./lane-width.manager";
import { LaneHeightManager } from "./lane-height.manager";
import { ParkingLaneManager } from "./parking-lane.manager";
import { LaneTypeChangedEvent } from "app/events/lane/lane-type-changed.event";

@Injectable( {
	providedIn: 'root'
} )
export class LaneManager {

	constructor (
		private laneWidthManager: LaneWidthManager,
		private laneHeightManager: LaneHeightManager,
		private parkingLaneManager: ParkingLaneManager
	) { }

	onLaneCreated ( lane: TvLane ) {

		this.laneWidthManager.updateLaneWidth( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.updateLaneHeight( lane.laneSection.road, lane.laneSection, lane );

		this.parkingLaneManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneRemoved ( lane: TvLane ) {

		this.parkingLaneManager.onLaneRemoved( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneUpdated ( lane: TvLane ) {

		//

	}

	onLaneTypeChanged ( lane: TvLane ) {

		this.laneWidthManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.updateLaneHeight( lane.laneSection.road, lane.laneSection, lane );

		this.parkingLaneManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

	}

}
