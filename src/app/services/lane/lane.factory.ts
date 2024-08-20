/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";

export abstract class LaneFactory {

	public static createDuplicate ( source: TvLane ): TvLane {

		const newLaneId = source.isLeft ? source.id + 1 : source.id - 1;

		const newLane = source.clone( newLaneId );

		this.copyRoadMarksFromNeighbour( source.laneSection, source, newLane );

		return newLane;

	}

	private static copyRoadMarksFromNeighbour ( laneSection: TvLaneSection, source: TvLane, clone: TvLane ): void {

		const neighborLaneId = source.isLeft ? source.id - 1 : source.id + 1;

		const neighborLane = laneSection.getLaneById( neighborLaneId );

		if ( !neighborLane ) return;

		clone.roadMarks.clear();

		source.roadMarks.forEach( roadMark => {

			clone.roadMarks.set( roadMark.s, roadMark.clone( roadMark.s, clone ) );

		} )

		source.roadMarks.clear();

		neighborLane.roadMarks.forEach( roadMark => {

			source.roadMarks.set( roadMark.s, roadMark.clone( roadMark.s, source ) );

		} );

	}

}
