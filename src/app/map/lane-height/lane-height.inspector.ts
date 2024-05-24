/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "../models/tv-lane";
import { TvLaneHeight } from "./lane-height.model";
import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { CommandHistory } from "app/services/command-history";
import { RemoveObjectCommand } from "app/commands/remove-object-command";

import { LaneNode } from "../../objects/lane-node";

export class LaneHeightInspector {

	constructor (
		public node: LaneNode<TvLaneHeight>
	) {
	}

	get laneHeight (): TvLaneHeight {
		return this.node.mainObject;
	}

	get lane (): TvLane {
		return this.node.lane;
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

	@SerializedAction( { label: 'Delete' } )
	delete () {
		CommandHistory.execute( new RemoveObjectCommand( this.node ) );
	}
}
