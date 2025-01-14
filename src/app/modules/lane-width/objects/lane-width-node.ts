/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Group, Vector3 } from "three";
import { TvLaneWidth } from '../../../map/models/tv-lane-width';
import { INode } from '../../../objects/i-selectable';
import { IHasCopyUpdate } from 'app/core/interfaces/has-copy-update';
import { TvLane } from "../../../map/models/tv-lane";
import { LaneWidthLine } from "./lane-width-line";
import { LaneWidthPoint } from "./lane-width-point";
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';

export class LaneWidthNode extends Group implements INode, IHasCopyUpdate {

	public line: LaneWidthLine;

	public point: LaneWidthPoint;

	public isSelected: boolean = false;

	constructor ( public readonly road: TvRoad, private _laneWidth: TvLaneWidth, private _lane: TvLane ) {
		super();
	}

	get lane (): TvLane {
		return this._lane;
	}

	set lane ( value: TvLane ) {
		this._lane = value;
	}

	get laneWidth (): TvLaneWidth {
		return this._laneWidth;
	}

	set laneWidth ( value: TvLaneWidth ) {
		this._laneWidth = value;
	}

	get s (): number {
		return this.laneWidth.s;
	}

	set s ( value ) {
		this.laneWidth.s = value;
	}


	update (): void {

		//

	}

	setPosition ( position: Vector3 ): void {

		//

	}

	getPosition (): Vector3 {

		return this.position;

	}

	onMouseOver (): void {

		//

	}

	onMouseOut (): void {

		//

	}

	updateLaneWidthValues (): void {

		//

	}

	select (): void {

		this.isSelected = true;
		this.point?.select();
		this.line?.select();

	}

	unselect (): void {

		this.isSelected = false;
		this.point?.unselect();
		this.line?.unselect();

	}

	static create ( laneCoord: TvLaneCoord, width: TvLaneWidth ): LaneWidthNode {

		const node = new LaneWidthNode( laneCoord.road, width, laneCoord.lane );

		const line = node.line = LaneWidthLine.createLine( laneCoord, width );

		const point = node.point = LaneWidthPoint.createPoint( laneCoord, width );

		node.add( line, point );

		return node;

	}

}
