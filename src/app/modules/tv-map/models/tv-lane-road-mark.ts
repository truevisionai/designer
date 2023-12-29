/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AssetDatabase } from 'app/core/asset/asset-database';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { MathUtils, MeshStandardMaterial } from 'three';
import { GameObject } from '../../../core/game-object';
import { LaneMarkingNode } from '../../three-js/objects/lane-road-mark-node';
import { TvColors, TvRoadMarkTypes, TvRoadMarkWeights } from './tv-common';
import { TvLane } from './tv-lane';

export class TvLaneRoadMark {

	public static ROADMARK_BROKEN_TILING = 3.0;
	public readonly uuid: string;
	public gameObject: GameObject;
	public attr_sOffset: number;
	public attr_type: TvRoadMarkTypes;
	public attr_weight: TvRoadMarkWeights;
	public attr_color: TvColors;

	public attr_width: number;
	public attr_laneChange: string;
	public attr_height: number = 0;
	public attr_length: number = 3.0;
	public attr_space: number = 4.5;

	/**
	 * @deprecated
	 */
	public lastSCoordinate: number;
	public readonly lane: TvLane;
	public node: LaneMarkingNode;

	private attr_materialDetails: string;
	private _materialGuid: string;
	private _material: MeshStandardMaterial;

	constructor (
		sOffset: number,
		type: TvRoadMarkTypes = TvRoadMarkTypes.SOLID,
		weight: TvRoadMarkWeights = TvRoadMarkWeights.STANDARD,
		color: TvColors = TvColors.STANDARD,
		width: number = null,
		laneChange: string,
		height: number = 0.05,
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
		this.attr_laneChange = laneChange;
		this.attr_height = height;
		this.attr_length = length;
		this.attr_space = space || this.getSpaceByType( type );

		if ( materialGuid ) {

			this.materialGuid = materialGuid;

		} else {

			this._material = new MeshStandardMaterial( {
				color: this.threeColor,
				roughness: 1.0,
				metalness: 0.0,
			} );

		}


		this.lane = lane;
	}

	get materialGuid (): string {
		return this._materialGuid;
	}

	set materialGuid ( value: string ) {
		this._materialGuid = value;
		this._material = AssetDatabase.getInstance( value );
		this._material.needsUpdate = true;
	}

	get material (): MeshStandardMaterial {
		return this._material;
	}

	set material ( value: MeshStandardMaterial ) {
		this._material = value;
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

		if ( this.material ) {
			this._material.color.set( this.threeColor );
			this._material.needsUpdate = true;
		}
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

	clone ( s?: number ) {

		return new TvLaneRoadMark(
			s || this.sOffset,
			this.type,
			this.weight,
			this.color,
			this.width,
			this.laneChange,
			this.height,
			this.lane,
			this.length,
			this.space,
			this.materialGuid,
		);
	}
}
