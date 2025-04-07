/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ColorUtils } from 'app/views/shared/utils/colors.service';
import { MathUtils } from "three";
import { GameObject } from '../../objects/game-object';
import { TvColors, TvRoadMarkTypes, TvRoadMarkWeights } from './tv-common';
import { TvLane } from './tv-lane';

export enum TvRoadMarkLaneChange {
	NONE = 'none',
	DECREASE = 'decrease',
	INCREASE = 'increase',
	BOTH = 'both',
}

export enum TvRoadMarkRule {
	CAUTION = 'caution',
	NO_PASSING = 'no_passing',
	NONE = 'none',
}

export const STANDARD_WIDTH = 0.15;
export const DASH_LENGTH = 3.0;
export const DASH_SPACE = 9.0;
export const DOUBLE_LINE_SPACE = 0.1;
export const BOTTS_DOTS_DIAMETER = 0.1;
export const BOTTS_DOTS_HEIGHT = 0.02;
export const BOTTS_DOTS_SPACE = 1.2;
export const CURB_HEIGHT = 0.15;
export const CURB_WIDTH = 0.3;

export class TvLaneRoadMark {

	public readonly uuid: string;

	private _lane: TvLane;

	public gameObject: GameObject;

	public sOffset: number;

	public type: TvRoadMarkTypes;

	public weight: TvRoadMarkWeights;

	public color: TvColors;

	public width: number;

	public laneChange: TvRoadMarkLaneChange;

	public height: number = 0;

	public length: number = 3.0;

	public space: number = 4.5;

	/**
	 * Material of the road mark. Identifiers to be defined by the user, use "standard" as default value.
	 */
	public materialName: string;

	/**
	 * GUID of the material of the road mark.
	 */
	public materialGuid: string;

	/**
	 * @deprecated
	 */
	public lastSCoordinate: number;

	/**
	 * Rule that must be observed when passing the line from inside, for example,
	 * from the lane with the lower absolute ID to the lane with
	 * the higher absolute ID
	 */
	public rule: TvRoadMarkRule;

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
		length: number = null,
		space: number = null,
		materialGuid: string = null
	) {

		this.uuid = MathUtils.generateUUID();

		this.sOffset = sOffset;
		this.type = type;
		this.weight = weight || TvRoadMarkWeights.STANDARD;
		this.color = color || TvColors.STANDARD;
		this.width = width || TvLaneRoadMark.getWidthByWeight( weight );
		this.laneChange = laneChange || TvRoadMarkLaneChange.NONE;
		this.height = height;
		this.length = length;
		this.space = space || TvLaneRoadMark.getSpaceByType( type );
		this.materialGuid = materialGuid;
		this.lane = lane;
		this.length = length || TvLaneRoadMark.getLengthByType( type );
	}

	get lane () {
		return this._lane;
	}

	set lane ( lane: TvLane ) {
		this._lane = lane;
	}

	/**
	 * @deprecated
	 */
	get s2 () {
		return this.lastSCoordinate - this.sOffset;
	}

	get s () {
		return this.sOffset;
	}

	set s ( value: number ) {
		this.sOffset = value;
	}

	get threeColor () {
		return ColorUtils.stringToColor( this.color );
	}

	getType (): TvRoadMarkTypes {
		return this.type;
	}

	setType ( value: any ): void {
		this.type = value;
	}

	static getSpaceByType ( value: TvRoadMarkTypes ): 0 | 4.5 | 1.2 {
		switch ( value ) {
			case TvRoadMarkTypes.SOLID:
				return 0;
			case TvRoadMarkTypes.BROKEN:
				return 4.5;
			case TvRoadMarkTypes.SOLID_SOLID:
				return 0;
			case TvRoadMarkTypes.SOLID_BROKEN:
				return 4.5;
			case TvRoadMarkTypes.BROKEN_SOLID:
				return 4.5;
			case TvRoadMarkTypes.BROKEN_BROKEN:
				return 4.5;
			case TvRoadMarkTypes.BOTTS_DOTS:
				return 1.2;
			case TvRoadMarkTypes.GRASS:
				return 0;
			case TvRoadMarkTypes.CURB:
				return 0;
			default:
				return 0;
		}

	}

	static getLengthByType ( value: TvRoadMarkTypes ): 1 | 3 {
		switch ( value ) {
			case TvRoadMarkTypes.SOLID:
				return 1.0;
			case TvRoadMarkTypes.BROKEN:
				return DASH_LENGTH;
			case TvRoadMarkTypes.SOLID_SOLID:
				return 1.0;
			case TvRoadMarkTypes.SOLID_BROKEN:
				return DASH_LENGTH;
			case TvRoadMarkTypes.BROKEN_SOLID:
				return DASH_LENGTH;
			case TvRoadMarkTypes.BROKEN_BROKEN:
				return DASH_LENGTH;
			case TvRoadMarkTypes.BOTTS_DOTS:
				return 1.0;
			case TvRoadMarkTypes.GRASS:
				return 1.0;
			case TvRoadMarkTypes.CURB:
				return 1.0;
			default:
				return 1.0;
		}
	}

	static getWidthByWeight ( value: TvRoadMarkWeights ): 0.3 | 0.15 {
		if ( value == TvRoadMarkWeights.BOLD ) {
			return 0.3;
		} else {
			return 0.15;
		}
	}

	clearMesh (): void {

		if ( this.gameObject ) {

			this.lane.laneSection?.road?.gameObject?.remove( this.gameObject );

			this.gameObject = null;

		}

	}

	clone ( s?: number, lane?: TvLane ): TvLaneRoadMark {

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

	static createSolid ( lane: TvLane, s: number ): TvLaneRoadMark {

		return new TvLaneRoadMark( s, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, TvRoadMarkLaneChange.NONE, 0, lane );

	}

	static laneChangeFromString ( value: string ): TvRoadMarkLaneChange {

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

	isMatching ( other: TvLaneRoadMark ): boolean {

		if ( this.type !== other.type ) return false;

		if ( this.weight !== other.weight ) return false;

		if ( this.color !== other.color ) return false;

		if ( this.width !== other.width ) return false;

		if ( this.laneChange !== other.laneChange ) return false;

		if ( this.height !== other.height ) return false;

		if ( this.length !== other.length ) return false;

		if ( this.space !== other.space ) return false;

		if ( this.rule !== other.rule ) return false;

		if ( this.materialGuid !== other.materialGuid ) return false;

		return true;

	}
}
