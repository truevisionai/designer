/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneWidth } from "../../../map/models/tv-lane-width";
import { LaneWidthNode } from "./lane-width-node";
import { TvRoad } from "../../../map/models/tv-road.model";
import { TvLaneSection } from "../../../map/models/tv-lane-section";
import { TvLane } from "../../../map/models/tv-lane";
import { SimpleControlPoint } from "../../../objects/simple-control-point";

export class LaneWidthPoint extends SimpleControlPoint<TvLaneWidth> {

	tag = LaneWidthNode.pointTag;

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

}
