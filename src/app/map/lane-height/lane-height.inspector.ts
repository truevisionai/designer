/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "../models/tv-lane";
import { TvLaneHeight } from "./lane-height.model";
import { SerializedField } from "../../core/components/serialization";

export class LaneHeightInspector {

	constructor (
		public lane: TvLane,
		public laneHeight: TvLaneHeight
	) {
	}

	@SerializedField( { type: 'float', min: 0 } )
	get distance (): number {
		return this.laneHeight.sOffset;
	}

	set distance ( value: number ) {
		this.laneHeight.sOffset = value;
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get innerHeight (): number {
		return this.laneHeight.inner;
	}

	set innerHeight ( value: number ) {
		this.laneHeight.setInner( value );
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get outerHeight (): number {
		return this.laneHeight.outer;
	}

	set outerHeight ( value: number ) {
		this.laneHeight.setOuter( value );
	}
}
