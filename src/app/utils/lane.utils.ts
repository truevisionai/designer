/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";

export class LaneUtils {

	static getPredecessorLane ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): TvLane {

		// if predecessor is not defined return
		if ( !lane.predecessor ) return;

		const predecessorLaneSection = this.predecessorLaneSection( road, laneSection );

		if ( !predecessorLaneSection ) return

		const predecessor = predecessorLaneSection.getLaneById( lane.predecessor );

		if ( !predecessor ) return;

		return predecessor;

	}

	static getSuccessorLane ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): TvLane {

		// if successor is not defined return
		if ( !lane.succcessor ) return;

		const successorLaneSection = this.successorLaneSection( road, laneSection );

		if ( !successorLaneSection ) return

		const succcessor = successorLaneSection.getLaneById( lane.succcessor );

		if ( !succcessor ) return;

		return succcessor;

	}

	static predecessorLaneSection ( road: TvRoad, laneSection: TvLaneSection ): TvLaneSection {

		return road.getPredecessorLaneSection( laneSection );

	}

	static successorLaneSection ( road: TvRoad, laneSection: TvLaneSection ): TvLaneSection {

		return road.getSuccessorLaneSection( laneSection );

	}

}
