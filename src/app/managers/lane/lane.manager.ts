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
	) {
	}

	onLaneCreated ( lane: TvLane ) {

		if ( lane.getRoad().isJunction ) return;

		this.laneLinkManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneWidthManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.parkingLaneManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

		this.laneMarkingManager.onLaneCreated( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneRemoved ( lane: TvLane ) {

		if ( lane.getRoad().isJunction ) return;

		this.parkingLaneManager.onLaneRemoved( lane.laneSection.road, lane.laneSection, lane );

		// if road has only 1 lane section and
		// that lane section has no lanes, then
		// remove the whole spline as we no longer have valid road
		if ( lane.getRoad().getLaneProfile().getLaneSectionCount() == 1 && lane.laneSection.getLaneCount() == 1 ) {

			MapEvents.splineRemoved.emit( new SplineRemovedEvent( lane.laneSection.road.spline ) );

		} else {

			MapEvents.roadUpdated.emit( new RoadUpdatedEvent( lane.laneSection.road ) );

		}

	}

	onLaneUpdated ( lane: TvLane ) {

		if ( lane.getRoad().isJunction ) return;

		this.laneWidthManager.onLaneUpdated( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.onLaneUpdated( lane.laneSection.road, lane.laneSection, lane );

	}

	onLaneTypeChanged ( lane: TvLane ) {

		if ( lane.getRoad().isJunction ) return;

		this.laneWidthManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

		this.laneHeightManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

		this.parkingLaneManager.onLaneTypeChanged( lane.laneSection.road, lane.laneSection, lane );

	}

}
