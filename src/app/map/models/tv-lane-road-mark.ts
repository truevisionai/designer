/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { COLOR } from 'app/views/shared/utils/colors.service';
import { MathUtils } from 'three';
import { GameObject } from '../../objects/game-object';
import { TvColors, TvRoadMarkTypes, TvRoadMarkWeights } from './tv-common';
import { TvLane } from './tv-lane';

export enum TvRoadMarkLaneChange {
	NONE = 'none',
	DECREASE = 'decrease',
	INCREASE = 'increase',
	BOTH = 'both',
}

export class TvLaneRoadMark {

	public readonly uuid: string;
	public gameObject: GameObject;
	public attr_sOffset: number;
	public attr_type: TvRoadMarkTypes;
	public attr_weight: TvRoadMarkWeights;
	public attr_color: TvColors;

	public attr_width: number;
	public attr_laneChange: TvRoadMarkLaneChange;
	public attr_height: number = 0;
	public attr_length: number = 3.0;
	public attr_space: number = 4.5;

	/**
	 * @deprecated
	 */
	public lastSCoordinate: number;
	public readonly lane: TvLane;

	private attr_materialDetails: string;
	private _materialGuid: string;

	/**
	 *
	 * @param sOffset
	 * @param type
	 * @param weight
	 * @param color
	 * @param width
	 * @param laneChange | Allows a lane change in the indicated direction,
	 * taking into account that lanes are numbered in ascending order
	 * from right to left. If the attribute is missing, “both” is used as default.
	 * @param height
	 * @param lane
	 * @param length
	 * @param space
	 * @param materialGuid
	 */
	constructor (
		sOffset: number,
		type: TvRoadMarkTypes = TvRoadMarkTypes.SOLID,
		weight: TvRoadMarkWeights = TvRoadMarkWeights.STANDARD,
		color: TvColors = TvColors.STANDARD,
		width: number = 0.0,
		laneChange: TvRoadMarkLaneChange = TvRoadMarkLaneChange.NONE,
		height: number = 0.00,
		lane: TvLane,
		length: number = 3.0,
		space: number = null,
		materialGuid: string = null
	) {

		this.uuid = MathUtils.generateUUID();

		this.attr_sOffset = sOffset;
		this.attr_type = type;
		this.attr_weight = weight || TvRoadMarkWeights.STANDARD;
		this.attr_color = color || TvColors.STANDARD;
		this.attr_width = width || this.getWidthByWeight( weight );
		this.attr_laneChange = laneChange || TvRoadMarkLaneChange.NONE;
		this.attr_height = height;
		this.attr_length = length;
		this.attr_space = space || this.getSpaceByType( type );
		this._materialGuid = materialGuid;
		this.lane = lane;
	}

	get materialGuid (): string {
		return this._materialGuid;
	}

	set materialGuid ( value: string ) {
		this._materialGuid = value;
	}

	get s2 () {
		return this.lastSCoordinate - this.sOffset;
	}

	get space () {
		return this.attr_space;
	}

	set space ( value: number ) {
		this.attr_space = value;
	}

	get length () {
		return this.attr_length;
	}

	set length ( value: number ) {
		this.attr_length = value;
	}

	get s () {
		return this.sOffset;
	}

	set s ( value: number ) {
		this.sOffset = value;
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
		this.attr_space = this.getSpaceByType( value );
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

	get threeColor () {
		return COLOR.stringToColor( this.attr_color );
	}

	get materialDetails () {
		return this.attr_materialDetails;
	}

	set materialDetails ( value: string ) {
		this.attr_materialDetails = value;
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

	getSpaceByType ( value: TvRoadMarkTypes ) {
		if ( value == TvRoadMarkTypes.BROKEN ) {
			return 4.5;
		} else {
			return 0;
		}
	}

	getWidthByWeight ( value: TvRoadMarkWeights ) {
		if ( value == TvRoadMarkWeights.BOLD ) {
			return 0.3;
		} else {
			return 0.15;
		}
	}

	clearMesh () {

		if ( this.gameObject ) {

			this.lane?.gameObject.remove( this.gameObject );

			this.gameObject = null;

		}

	}

	clone ( s?: number, lane?: TvLane ) {

		return new TvLaneRoadMark(
			s || this.sOffset,
			this.type,
			this.weight,
			this.color,
			this.width,
			this.laneChange,
			this.height,
			lane || this.lane,
			this.length,
			this.space,
			this.materialGuid,
		);
	}

	static laneChangeFromString ( value: string ) {

		switch ( value ) {

			case 'none':
				return TvRoadMarkLaneChange.NONE;

			case 'decrease':
				return TvRoadMarkLaneChange.DECREASE;

			case 'increase':
				return TvRoadMarkLaneChange.INCREASE;

			case 'both':
				return TvRoadMarkLaneChange.BOTH;

			default:
				return TvRoadMarkLaneChange.NONE;
		}
	}

}
