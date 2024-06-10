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

export enum TvRoadMarkRule {
	CAUTION = 'caution',
	NO_PASSING = 'no_passing',
	NONE = 'none',
}

export class TvLaneRoadMark {

	public readonly uuid: string;

	public readonly lane: TvLane;

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
		length: number = 3.0,
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
	}

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
		return COLOR.stringToColor( this.color );
	}

	getType () {
		return this.type;
	}

	setType ( value ) {
		this.type = value;
	}

	static getSpaceByType ( value: TvRoadMarkTypes ) {
		if ( value == TvRoadMarkTypes.BROKEN ) {
			return 4.5;
		} else {
			return 0;
		}
	}

	static getWidthByWeight ( value: TvRoadMarkWeights ) {
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

	static createSolid ( lane: TvLane, s: number ): TvLaneRoadMark {

		return new TvLaneRoadMark( s, TvRoadMarkTypes.SOLID, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, TvRoadMarkLaneChange.NONE, 0, lane );

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
