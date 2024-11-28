/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "app/map/models/tv-road.model";
import { LaneUtils } from "./lane.utils";

export class LinkUtils {

	/**
	 * This method links the lanes of a road to their predecessors and successors
	 * It only updates the UUIDs of the lanes, not the IDs
	 * Ideally this should be called on map load and then whenever a road is modified
	 * The linking helps in junction connections and lane changing
	 * @param road
	 */
	static updateLaneUuidLinks ( road: TvRoad ) {

		for ( let i = 0; i < road.laneSections.length; i++ ) {

			const laneSection = road.laneSections[ i ];

			for ( const currentLane of laneSection.getNonCenterLanes() ) {

				// Update successor
				if ( i < road.laneSections.length - 1 ) {

					// If not the last lane section, look in the next lane section of the same road

					const nextLaneSection = road.laneSections[ i + 1 ];

					const id = currentLane.successorId ?? currentLane.id;

					const successorLane = nextLaneSection.getLaneById( id );

					if ( successorLane ) {

						currentLane.setSuccessor( successorLane );

					}

				} else {

					// If last lane section, we need to look at the next road (if any)
					const nextLaneSection = LaneUtils.findNextLaneSection( road, laneSection );

					if ( nextLaneSection ) {

						const id = currentLane.successorId ?? currentLane.id;

						const successorLane = nextLaneSection.getLaneById( id );

						if ( successorLane ) {

							currentLane.setSuccessor( successorLane );

						}

					}

				}

				// Update predecessor
				if ( i > 0 ) {

					// If not the first lane section, look in the previous lane section of the same road
					const prevLaneSection = road.laneSections[ i - 1 ];

					const id = currentLane.predecessorId ?? currentLane.id;

					const predecessorLane = prevLaneSection.getLaneById( id );

					if ( predecessorLane ) {

						currentLane.setPredecessor( predecessorLane );

					}

				} else {

					// If first lane section, we need to look at the previous road (if any)
					const prevLaneSection = LaneUtils.findPreviousLaneSection( road, laneSection );

					if ( prevLaneSection ) {

						const id = currentLane.predecessorId ?? currentLane.id;

						const predecessorLane = prevLaneSection.getLaneById( id );

						if ( predecessorLane ) {

							currentLane.setPredecessor( predecessorLane );

						}
					}
				}
			}
		}
	}
}
