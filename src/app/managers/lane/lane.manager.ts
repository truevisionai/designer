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
import { LaneMaterialManager } from "./lane-material.manager";
import { MapEvents } from "../../events/map-events";
import { SplineRemovedEvent } from "../../events/spline/spline-removed-event";
import { RoadUpdatedEvent } from "../../events/road/road-updated-event";

@Injectable( {
	providedIn: 'root'
} )
export class LaneManager {

	constructor (
		private laneWidthManager: LaneWidthManager,
		private laneHeightManager: LaneHeightManager,
		private parkingLaneManager: ParkingLaneManager,
		private laneMarkingManager: LaneMarkingManager,
		private laneLinkManager: LaneLinkManager,
		private laneMaterialManager: LaneMaterialManager,
	) {
	}

	onLaneCreated ( lane: TvLane ) {

		this.laneLinkManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneWidthManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.parkingLaneManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneMarkingManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneRemoved ( lane: TvLane ) {

		this.parkingLaneManager.onLaneRemoved( lane.laneSection.road, lane.laneSection, lane );

		// if road has only 1 lane section and
		// that lane section has no lanes, then
		// remove the whole spline as we no longer have valid road
		if ( lane.laneSection.road.laneSections.length == 1 && lane.laneSection.lanes.size == 1 ) {

			MapEvents.splineRemoved.emit( new SplineRemovedEvent( lane.laneSection.road.spline ) );

		} else {

			MapEvents.roadUpdated.emit( new RoadUpdatedEvent( lane.laneSection.road ) );

		}

	}

	onLaneUpdated ( lane: TvLane ) {

		this.laneWidthManager.onLaneUpdated( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.onLaneUpdated( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneTypeChanged ( lane: TvLane ) {

		this.laneWidthManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.onLaneUpdated( lane.laneSection.road, lane.laneSection, lane );

		this.parkingLaneManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

		this.laneMaterialManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

	}

}
