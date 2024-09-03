/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DebugLine } from "../../../objects/debug-line";
import { TvLaneWidth } from "../../../map/models/tv-lane-width";
import { TvRoad } from "../../../map/models/tv-road.model";
import { TvLaneSection } from "../../../map/models/tv-lane-section";
import { TvLane } from "../../../map/models/tv-lane";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

export class LaneWidthLine extends DebugLine<TvLaneWidth> {

	constructor (
		public road: TvRoad,
		public laneSection: TvLaneSection,
		public lane: TvLane,
		public width: TvLaneWidth,
		public geometry: LineGeometry,
		public material: LineMaterial
	) {
		super( width, geometry, material );
	}

	get s (): number {
		return this.width.s;
	}

	set s ( value: number ) {
		this.width.s = value;
	}

}
