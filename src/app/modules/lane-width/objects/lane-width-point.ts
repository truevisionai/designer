/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneWidth } from "../../../map/models/tv-lane-width";
import { TvRoad } from "../../../map/models/tv-road.model";
import { TvLaneSection } from "../../../map/models/tv-lane-section";
import { TvLane } from "../../../map/models/tv-lane";
import { SimpleControlPoint } from "../../../objects/simple-control-point";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";

export class LaneWidthPoint extends SimpleControlPoint<TvLaneWidth> {

	public static readonly tag = 'width-point';

	tag = LaneWidthPoint.tag;

	constructor (
		public road: TvRoad,
		public laneSection: TvLaneSection,
		public lane: TvLane,
		public width: TvLaneWidth
	) {
		super( width );
	}

	get a (): number {
		return this.width.a;
	}

	set a ( value: number ) {
		this.width.a = value;
	}

	static createPoint ( laneCoord: TvLaneCoord, laneWidth: TvLaneWidth ): LaneWidthPoint {

		const road = laneCoord.road;

		const laneSection = laneCoord.laneSection;

		const lane = laneCoord.lane;

		const end = RoadGeometryService.instance.findLaneEndPosition( road, laneSection, lane, laneWidth.s );

		const point = new LaneWidthPoint( road, laneSection, lane, laneWidth );

		point.setPosition( end.position );

		return point;

	}

}
