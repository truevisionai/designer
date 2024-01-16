import { Injectable } from '@angular/core';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

@Injectable( {
	providedIn: 'root'
} )
export class LaneLinkManager {

	constructor () { }

	onLaneCreated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		const prevLaneSection = road.getPredecessorLaneSection( laneSection );
		const nextLaneSection = road.getSuccessorLaneSection( laneSection );

		if ( !lane.predecessor && prevLaneSection ) {
			lane.setPredecessor( prevLaneSection.getNearestLane( lane )?.id );
		}

		if ( !lane.succcessor && nextLaneSection ) {
			lane.setSuccessor( nextLaneSection.getNearestLane( lane )?.id );
		}
	}

	linkLaneSections ( predecessor: TvLaneSection, succcessor: TvLaneSection ) {

		const predecessorLanes = predecessor.getLaneArray();

		const successorLanes = succcessor.getLaneArray();

		for ( let i = 0; i < predecessorLanes.length; i++ ) {

			const successorLane = this.findSuccessor( predecessorLanes[ i ], successorLanes );

			predecessorLanes[ i ].successor = successorLane?.id;

		}

		for ( let i = 0; i < successorLanes.length; i++ ) {

			const predecessorLane = this.findPredecessor( successorLanes[ i ], predecessorLanes );

			successorLanes[ i ].predecessor = predecessorLane?.id;

		}

	}

	findSuccessor ( target: TvLane, lanes: TvLane[] ): TvLane {

		return TvLaneSection.getNearestLane( lanes, target );

	}

	findPredecessor ( target: TvLane, lanes: TvLane[] ): TvLane {

		return TvLaneSection.getNearestLane( lanes, target );

	}

}
