/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvLane } from "app/map/models/tv-lane";
import { LaneWidthManager } from "./lane-width.manager";
import { LaneHeightManager } from "./lane-height.manager";
import { ParkingLaneManager } from "./parking-lane.manager";
import { LaneMarkingManager } from "./lane-marking.manager";
import { LaneLinkManager } from "./lane-link.manager";

@Injectable( {
	providedIn: 'root'
} )
export class LaneManager {

	constructor (
		private laneWidthManager: LaneWidthManager,
		private laneHeightManager: LaneHeightManager,
		private parkingLaneManager: ParkingLaneManager,
		private laneMarkingManager: LaneMarkingManager,
		private laneLinkManager: LaneLinkManager
	) { }

	onLaneCreated ( lane: TvLane ) {

		this.laneLinkManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneWidthManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.updateLaneHeight( lane.laneSection.road, lane.laneSection, lane );

		this.parkingLaneManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneMarkingManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneRemoved ( lane: TvLane ) {

		this.parkingLaneManager.onLaneRemoved( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneUpdated ( lane: TvLane ) {

		this.laneWidthManager.onLaneUpdated( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneTypeChanged ( lane: TvLane ) {

		this.laneWidthManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.updateLaneHeight( lane.laneSection.road, lane.laneSection, lane );

		this.parkingLaneManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

	}

}
