/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSide, TvLaneType } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";

export abstract class LaneFactory {

	public static createLeftLane ( id: number, type: TvLaneType, roadId: number, laneSection: TvLaneSection ): TvLane {

		return this.createLane( TvLaneSide.LEFT, id, type, roadId, laneSection );

	}

	public static createCenterLane ( roadId: number, laneSection: TvLaneSection ): TvLane {

		return this.createLane( TvLaneSide.CENTER, 0, TvLaneType.none, roadId, laneSection );

	}

	public static createRightLane ( id: number, type: TvLaneType, roadId: number, laneSection: TvLaneSection ): TvLane {

		return this.createLane( TvLaneSide.RIGHT, id, type, roadId, laneSection );

	}

	public static createLane ( side: TvLaneSide, id: number, type: TvLaneType, roadId: number, laneSection: TvLaneSection ): TvLane {

		let lane: TvLane;

		switch ( type ) {

			case TvLaneType.driving:
				lane = new TvLane( side, id, type, false, laneSection );
				break;

			default:
				lane = new TvLane( side, id, type, false, laneSection );
				break;

		}

		lane.laneSection = laneSection;

		return lane;

	}

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
