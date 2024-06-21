/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvLaneSide, TvLaneType, TvRoadMarkTypes } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class LaneMarkingManager {

	onLaneCreated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		// TODO: add after testing
		return;

		// if ( lane.type != TvLaneType.driving ) return;
		//
		// let L2: TvLane;
		// let L1: TvLane;
		// let R1: TvLane;
		// let R2: TvLane;
		//
		// if ( lane.side == TvLaneSide.RIGHT ) {
		//
		// 	L2 = laneSection.lanes.get( lane.id + 2 );
		// 	L1 = laneSection.lanes.get( lane.id + 1 );
		// 	R1 = laneSection.lanes.get( lane.id - 1 );
		// 	R2 = laneSection.lanes.get( lane.id - 2 );
		//
		// } else if ( lane.side == TvLaneSide.LEFT ) {
		//
		// 	L2 = laneSection.lanes.get( lane.id - 2 );
		// 	L1 = laneSection.lanes.get( lane.id - 1 );
		// 	R1 = laneSection.lanes.get( lane.id + 1 );
		// 	R2 = laneSection.lanes.get( lane.id + 2 );
		//
		// }
		//
		// if ( L1 && L1.type == TvLaneType.driving ) {
		//
		// 	L1.roadMarks.splice( 0, L1.roadMarks.length );
		//
		// 	if ( L2 && L2.roadMarks.length > 0 ) {
		//
		// 		const clone = L2.roadMarks[ 0 ].clone( 0, L1 );
		//
		// 		L1.addRoadMarkInstance( clone )
		//
		// 	} else {
		//
		// 		L1.addRoadMarkOfType( 0, TvRoadMarkTypes.SOLID );
		//
		// 	}
		//
		// }

	}

	onLaneRemoved ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		//

	}

	onLaneUpdated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		//

	}

	onLaneTypeChanged ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( lane.type != TvLaneType.driving ) return;

	}

}
