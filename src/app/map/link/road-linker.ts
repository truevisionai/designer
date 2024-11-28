/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from '../models/tv-road.model';
import { TvContactPoint } from '../models/tv-common';

export class RoadLinker {

	private static _instance: RoadLinker;

	static get instance (): RoadLinker {

		if ( !RoadLinker._instance ) {
			RoadLinker._instance = new RoadLinker();
		}

		return RoadLinker._instance;
	}

	private constructor () { }

	linkSuccessorRoad ( road: TvRoad, otherRoad: TvRoad, otherRoadContact: TvContactPoint ): void {

		road.setSuccessorRoad( otherRoad, otherRoadContact );

		const laneSection = road.getLaneProfile().getLastLaneSection();

		const otherLaneSection = otherRoad.getLaneProfile().getLaneSectionAtContact( otherRoadContact );

		laneSection.linkSuccessor( otherLaneSection, otherRoadContact );

		if ( otherRoadContact == TvContactPoint.START ) {

			otherRoad.setPredecessorRoad( road, TvContactPoint.END );

			otherLaneSection.linkPredecessor( laneSection, TvContactPoint.END );

		} else {

			otherRoad.setSuccessorRoad( road, TvContactPoint.END );

			otherLaneSection.linkSuccessor( laneSection, TvContactPoint.END );

		}

	}

	linkPredecessorRoad ( road: TvRoad, otherRoad: TvRoad, otherRoadContact: TvContactPoint ): void {

		road.setPredecessorRoad( otherRoad, otherRoadContact );

		const laneSection = road.getLaneProfile().getFirstLaneSection();

		const otherLaneSection = otherRoad.getLaneProfile().getLaneSectionAtContact( otherRoadContact );

		laneSection.linkPredecessor( otherLaneSection, otherRoadContact );

		if ( otherRoadContact == TvContactPoint.START ) {

			otherRoad.setPredecessorRoad( road, TvContactPoint.START );

			otherLaneSection.linkPredecessor( laneSection, TvContactPoint.START );

		} else {

			otherRoad.setSuccessorRoad( road, TvContactPoint.START );

			otherLaneSection.linkSuccessor( laneSection, TvContactPoint.START );

		}

	}

}
