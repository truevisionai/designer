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

			for ( const [ laneId, currentLane ] of laneSection.lanes ) {

				// Update successor
				if ( i < road.laneSections.length - 1 ) {

					// If not the last lane section, look in the next lane section of the same road

					const nextLaneSection = road.laneSections[ i + 1 ];

					const id = currentLane.successorId !== null ? currentLane.successorId : currentLane.id;

					const successorLane = nextLaneSection.lanes.get( id );

					if ( successorLane ) {

						currentLane.successorUUID = successorLane.uuid;

					}

				} else {

					// If last lane section, we need to look at the next road (if any)
					const nextLaneSection = LaneUtils.findNextLaneSection( road, laneSection );

					if ( nextLaneSection ) {

						const id = currentLane.successorId !== null ? currentLane.successorId : currentLane.id;

						const successorLane = nextLaneSection.lanes.get( id );

						if ( successorLane ) {

							currentLane.successorUUID = successorLane.uuid;

						}

					}

				}

				// Update predecessor
				if ( i > 0 ) {

					// If not the first lane section, look in the previous lane section of the same road
					const prevLaneSection = road.laneSections[ i - 1 ];

					const id = currentLane.predecessorId !== null ? currentLane.predecessorId : currentLane.id;

					const predecessorLane = prevLaneSection.lanes.get( id );

					if ( predecessorLane ) {

						currentLane.predecessorUUID = predecessorLane.uuid;

					}

				} else {

					// If first lane section, we need to look at the previous road (if any)
					const prevLaneSection = LaneUtils.findPreviousLaneSection( road, laneSection );

					if ( prevLaneSection ) {

						const id = currentLane.predecessorId !== null ? currentLane.predecessorId : currentLane.id;

						const predecessorLane = prevLaneSection.lanes.get( id );

						if ( predecessorLane ) {

							currentLane.predecessorUUID = predecessorLane.uuid;

						}
					}
				}
			}
		}
	}
}
