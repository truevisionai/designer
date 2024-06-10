/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneHeight } from "./lane-height.model";
import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { CommandHistory } from "app/services/command-history";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { TvLane } from "../models/tv-lane";

export class LaneHeightInspector {

	constructor (
		public laneHeight: TvLaneHeight,
		public lane: TvLane
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
		this.laneHeight.inner = value;
	}

	@SerializedField( { type: 'float', min: 0, max: 1 } )
	get outerHeight (): number {
		return this.laneHeight.outer;
	}

	set outerHeight ( value: number ) {
		this.laneHeight.outer = value;
	}

	@SerializedAction( { label: 'Delete' } )
	delete () {
		CommandHistory.execute( new RemoveObjectCommand( this ) );
	}
}
