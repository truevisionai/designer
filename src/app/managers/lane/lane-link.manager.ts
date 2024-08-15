/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoad } from 'app/map/models/tv-road.model';
import { LaneUtils } from 'app/utils/lane.utils';

@Injectable( {
	providedIn: 'root'
} )
export class LaneLinkManager {

	constructor () { }

	onLaneCreated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		// for connections we dont want to manage links forn
		if ( road.isJunction ) return;

		const prevLaneSection = LaneUtils.findPreviousLaneSection( road, laneSection );
		const nextLaneSection = LaneUtils.findNextLaneSection( road, laneSection );

		if ( !lane.predecessorExists && prevLaneSection ) {
			lane.predecessorId = ( prevLaneSection.getNearestLane( lane )?.id );
		}

		if ( !lane.successorExists && nextLaneSection ) {
			lane.successorId = ( nextLaneSection.getNearestLane( lane )?.id );
		}
	}

	linkLaneSections ( predecessor: TvLaneSection, succcessor: TvLaneSection ) {

		const predecessorLanes = predecessor.getLaneArray();

		const successorLanes = succcessor.getLaneArray();

		for ( let i = 0; i < predecessorLanes.length; i++ ) {

			const successorLane = this.findSuccessor( predecessorLanes[ i ], successorLanes );

			predecessorLanes[ i ].successorId = successorLane?.id;

		}

		for ( let i = 0; i < successorLanes.length; i++ ) {

			const predecessorLane = this.findPredecessor( successorLanes[ i ], predecessorLanes );

			successorLanes[ i ].predecessorId = predecessorLane?.id;

		}

	}

	findSuccessor ( target: TvLane, lanes: TvLane[] ): TvLane {

		return TvLaneSection.getNearestLane( lanes, target );

	}

	findPredecessor ( target: TvLane, lanes: TvLane[] ): TvLane {

		return TvLaneSection.getNearestLane( lanes, target );

	}

}
