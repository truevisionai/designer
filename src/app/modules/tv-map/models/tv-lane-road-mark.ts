/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from 'app/core/services/scene.service';
import { MathUtils } from 'three';
import { GameObject } from '../../../core/game-object';
import { LaneRoadMarkNode } from '../../three-js/objects/control-point';
import { TvColors, TvRoadMarkTypes, TvRoadMarkWeights } from './tv-common';
import { TvLane } from './tv-lane';

export class TvLaneRoadMark {

	// widths for the two types of weight values
	public static STD_ROADMARK_WIDTH = 0.15;
	public static BOLD_ROADMARK_WIDTH = 0.3;
	// elevation shift, so that the road mark is drawn above the road
	public static ROADMARK_ELEVATION_SHIFT = 0.01;
	// broken mark tiling
	public static ROADMARK_BROKEN_TILING = 3.0;
	public readonly uuid: string;
	public gameObject: GameObject;
	public attr_sOffset: number;
	public attr_type: TvRoadMarkTypes;
	public attr_weight: TvRoadMarkWeights;
	public attr_color: TvColors;
	public attr_material: string;
	public attr_width: number;
	public attr_laneChange: string;
	public attr_height: number = 0;
	public lastSCoordinate: number;
	public readonly lane: TvLane;
	public node: LaneRoadMarkNode;

	constructor (
		sOffset: number,
		type: TvRoadMarkTypes,
		weight: TvRoadMarkWeights,
		color: TvColors,
		width: number,
		laneChange: string,
		height: number,
		lane: TvLane
	) {

		this.uuid = MathUtils.generateUUID();

		this.attr_sOffset = sOffset;
		this.attr_type = type;
		this.attr_weight = weight;
		this.attr_color = color;
		this.attr_width = width;
		this.attr_laneChange = laneChange;
		this.attr_height = height;

		this.lane = lane;
	}

	get length () {
		return this.lastSCoordinate - this.sOffset;
	}

	get s () {
		return this.sOffset;
	}

	get sOffset () {
		return this.attr_sOffset;
	}

	set sOffset ( value ) {
		this.attr_sOffset = value;
	}

	get type () {
		return this.attr_type;
	}

	set type ( value: TvRoadMarkTypes ) {
		this.attr_type = value;
	}

	get weight (): TvRoadMarkWeights {
		return this.attr_weight;
	}

	set weight ( value ) {
		this.attr_weight = value;
	}

	get color () {
		return this.attr_color;
	}

	set color ( value: TvColors ) {
		this.attr_color = value;
	}

	get material () {
		return this.attr_material;
	}

	get width () {
		return this.attr_width;
	}

	set width ( value: number ) {
		this.attr_width = value;
	}

	get laneChange () {
		return this.attr_laneChange;
	}

	get height () {
		return this.attr_height;
	}

	getType () {
		return this.attr_type;
	}

	setType ( value ) {
		this.attr_type = value;
	}

	getWeight () {
		return this.attr_weight;
	}

	setWeight ( value ) {
		this.attr_weight = value;
	}

	getColor () {
		return this.attr_color;
	}

	setColor ( value ) {
		this.attr_color = value;
	}

	getMaterial () {
		return this.attr_material;
	}

	setMaterial ( value ) {
		this.attr_material = value;
	}

	getWidth () {
		return this.attr_width;
	}

	setWidth ( value ) {
		this.attr_width = value;
	}

	getLaneChange () {
		return this.attr_laneChange;
	}

	setLaneChange ( value ) {
		this.attr_laneChange = value;
	}

	getHeight () {
		return this.attr_height;
	}

	setHeight ( value ) {
		this.attr_height = value;
	}

	clearMesh () {

		if ( this.gameObject ) {

			SceneService.remove( this.gameObject );

			this.lane?.gameObject.remove( this.gameObject );

			this.gameObject = null;

		}

	}

	clone ( s?: number ) {

		return new TvLaneRoadMark(
			s || this.sOffset,
			this.type,
			this.weight,
			this.color,
			this.width,
			this.laneChange,
			this.height,
			this.lane
		);
	}
}
