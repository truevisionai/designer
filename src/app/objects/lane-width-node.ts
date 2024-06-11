/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Group, Vector3 } from 'three';
import { TvLaneWidth } from '../map/models/tv-lane-width';
import { INode } from './i-selectable';
import { AnyControlPoint } from "./any-control-point";
import { IHasCopyUpdate } from 'app/commands/copy-position-command';
import { DebugLine } from 'app/objects/debug-line';
import { TvLane } from "../map/models/tv-lane";

export class LaneWidthNode extends Group implements INode, IHasCopyUpdate {

	public static readonly tag = 'width-node';
	public static readonly pointTag = 'width-point';
	public static readonly lineTag = 'width-line';

	public line: DebugLine<LaneWidthNode>;

	public point: AnyControlPoint;

	public isSelected: boolean = false;

	get s () {
		return this.laneWidth.s;
	}

	set s ( value ) {
		this.laneWidth.s = value;
	}

	constructor ( public laneWidth: TvLaneWidth, public lane: TvLane ) {

		super();

	}

	update (): void {

		//

	}

	setPosition ( position: Vector3 ): void {

		//

	}

	copyPosition ( position: Vector3 ): void {

		//

	}

	getPosition (): Vector3 {

		return this.position;

	}

	onMouseOver () {

		//

	}

	onMouseOut () {

		//

	}

	updateLaneWidthValues () {

		//

	}

	select () {

		this.isSelected = true;
		this.point?.select();
		this.line?.select();

	}

	unselect () {

		this.isSelected = false;
		this.point?.unselect();
		this.line?.unselect();

	}

}
