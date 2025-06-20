/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";


export function traverseLanes ( road: TvRoad, currentLaneId: number, callback: ( lane: TvLane, laneSection: TvLaneSection ) => void ): void {

	const laneSections = road.getLaneProfile().getLaneSections();

	let currentLaneSectionIndex = 0;
	let currentLaneSection = laneSections[ currentLaneSectionIndex ];
	let currentLane: TvLane;

	while ( currentLaneId != null ) {

		// Check if laneSectionIndex is out of bounds
		if ( currentLaneSectionIndex >= laneSections.length ) {
			break;
		}

		// Check if the current lane section has the current lane ID
		if ( !currentLaneSection.hasLane( currentLaneId ) ) {
			break;
		}

		// Get the current lane by ID
		currentLane = currentLaneSection.getLaneById( currentLaneId );

		// Call the callback with the current lane and lane section
		callback( currentLane, currentLaneSection );

		// Get the successor lane ID to move to the next lane
		currentLaneId = currentLane.successorId;

		// Move to the next lane section
		currentLaneSectionIndex += 1;

		// Ensure we are still within bounds before updating the lane section
		if ( currentLaneSectionIndex < laneSections.length ) {
			currentLaneSection = laneSections[ currentLaneSectionIndex ];
		}

	}

}
