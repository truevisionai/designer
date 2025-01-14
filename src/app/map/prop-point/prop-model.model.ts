/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'app/core/maths';
import { SerializedField } from '../../core/components/serialization';
import { TvRoadObjectType } from "../models/objects/tv-road-object";

/**
 * Prop class instance holds info about the prop
 */
export class PropModel {

	@SerializedField( { type: 'string', disabled: true } )
	get guid (): string {
		return this._guid;
	}

	set guid ( value: string ) {
		this._guid = value;
	}

	@SerializedField( { type: 'vector3' } )
	get rotationVariance (): Vector3 {
		return this._rotationVariance;
	}

	set rotationVariance ( value: Vector3 ) {
		this._rotationVariance = value;
	}

	@SerializedField( { type: 'vector3' } )
	get scaleVariance (): Vector3 {
		return this._scaleVariance;
	}

	set scaleVariance ( value: Vector3 ) {
		this._scaleVariance = value;
	}

	@SerializedField( { type: 'enum', enum: TvRoadObjectType } )
	get propType (): TvRoadObjectType {
		return this._propType;
	}

	set propType ( value: TvRoadObjectType ) {
		this._propType = value;
	}

	private _propType: TvRoadObjectType = TvRoadObjectType.none;

	constructor (
		private _guid: string,
		private _rotationVariance: Vector3 = new Vector3(),
		private _scaleVariance: Vector3 = new Vector3()
	) {

	}
}
