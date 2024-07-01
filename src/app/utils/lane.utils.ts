/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "app/map/models/tv-lane";
import { TvRoad } from "app/map/models/tv-road.model";
import { TrafficRule } from "../map/models/traffic-rule";
import { TvLaneSide } from "../map/models/tv-common";
import { TvLaneSection } from "app/map/models/tv-lane-section";

export class LaneUtils {

	static getNextLaneSection ( road: TvRoad, laneSection: TvLaneSection ): TvLaneSection | null {

		const index = road.laneSections.indexOf( laneSection );

		if ( index == road.laneSections.length - 1 ) {

			return null;

		}

		return road.laneSections[ index + 1 ];

	}

	static inRoadDirection ( road: TvRoad, lane: TvLane ): boolean {

		if ( road.trafficRule == TrafficRule.RHT ) {

			return lane.side === TvLaneSide.RIGHT;

		} else if ( road.trafficRule == TrafficRule.LHT ) {

			return lane.side === TvLaneSide.LEFT;

		} else {

			return false;

		}

	}
}
