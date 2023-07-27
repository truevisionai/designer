/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { Vector3 } from 'three';
import { IMovable } from '../../../core/snapping/snap-strategies/snapping';
import { AnyControlPoint } from '../../three-js/objects/control-point';
import { TvMapQueries } from '../queries/tv-map-queries';
import { SignShapeType } from '../services/tv-sign.service';
import { TvDynamicTypes, TvOrientation, TvUnit, TvUserData } from './tv-common';
import { TvLaneValidity } from './tv-road-object';

export class TvRoadSignal implements IMovable {

	public static counter = 1;

	public s: number;
	public t: number;
	public id: number;
	public name: string;
	public dynamic: TvDynamicTypes;
	public orientations: TvOrientation;
	public zOffset: number;
	public country: string;
	public type: string;
	public subtype: string;
	public value: number;
	public unit: TvUnit;
	public height: number;
	public width: number;
	public text: string;
	public hOffset: number;
	public pitch: number;
	public roll: number;
	public validities: TvLaneValidity[] = [];
	public dependencies: TvSignalDependency[] = [];
	public signalReferences: TvSignalReference[] = [];
	public roadId: number;

	public controlPoint?: AnyControlPoint;

	constructor (
		s: number,
		t: number,
		id: number,
		name: string,
		dynamic: TvDynamicTypes,
		orientation: TvOrientation,
		zOffset?: number,
		country?: string,
		type?: string,
		subtype?: string,
		value?: number,
		unit: TvUnit = null,
		height: number = 0,
		width: number = 0,
		text: string = '',
		hOffset: number = 0,
		pitch: number = 0,
		roll: number = 0
	) {

		TvRoadSignal.counter++;

		this.s = s;
		this.t = t;
		this.id = id;
		this.name = name;
		this.dynamic = dynamic;
		this.orientations = orientation;
		this.zOffset = zOffset;
		this.country = country;
		this.type = type;
		this.subtype = subtype;
		this.value = value;
		this.unit = unit;
		this.height = height;
		this.width = width;
		this.text = text;
		this.hOffset = hOffset;
		this.pitch = pitch;
		this.roll = roll;

	}

	private _gameObject: GameObject;

	get gameObject () {
		return this._gameObject;
	}

	set gameObject ( value ) {
		this._gameObject = value;
	}

	getRoad () {
		return TvMapQueries.findRoadById( this.roadId );
	}

	private _userData: Map<string, TvUserData> = new Map<string, TvUserData>();

	set userData ( values: TvUserData[] ) {
		values.forEach( data => this._userData.set( data.attr_code, data ) );
	}

	private _signShape: SignShapeType;

	get signShape () {
		return this._signShape;
	}

	set signShape ( value ) {
		this._signShape = value;
	}

	get userDataMap () {
		return this._userData;
	}

	get assetName () {
		return this._userData.get( 'asset_name' );
	}

	getUserData () {
		return this._userData;
	}

	addValidity ( fromLane: number, toLane: number ): void {
		this.validities.push( new TvLaneValidity( fromLane, toLane ) );
	}

	getValidity ( index: number ): TvLaneValidity {
		return this.validities[ index ];
	}

	getValidityCount (): number {
		return this.validities.length;
	}

	addDependency ( id: number, type: string ) {
		this.dependencies.push( new TvSignalDependency( id, type ) );
	}

	getDependency ( index: number ): TvSignalDependency {
		return this.dependencies[ index ];
	}

	getDependencyCount (): number {
		return this.dependencies.length;
	}

	getSignalReference ( index: number ): TvSignalReference {
		return this.signalReferences[ index ];
	}

	getSignalReferenceCount (): number {
		return this.signalReferences.length;
	}

	addUserData ( key: string, value: string ) {
		this._userData.set( key, new TvUserData( key, value ) );
	}

	move ( position: Vector3 ): void {
		this.gameObject?.position.copy( position );
		this.controlPoint?.position.copy( position );
	}
}

/**
 * The signal dependency record provides signals with a means to control other signals. Signs can e.g.
 * restrict other signs for various types of vehicles, warning lights can be turned on when a traffic light
 * goes red etc. The signal dependency record is an optional child record of the signal record. A signal
 * may have multiple dependency records.
 */
export class TvSignalDependency {
	public id: number;
	public type: string;

	constructor ( id: number, type: string ) {
		this.id = id;
		this.type = type;
	}

}

/**
 * Depending on the way roads (especially in junctions) are laid out for different applications, it may be
 * necessary to refer to the same (i.e. the identical) sign from multiple roads. In order to prevent
 * inconsistencies by multiply defining an entire signal entry, the user only needs to define the complete
 * signal entry once and can refer to this complete record by means of the signal reference record.
 */
export class TvSignalReference {
	public s: number;
	public t: number;
	public id: number;
	public orientations: TvOrientation;
	public laneValidities: TvLaneValidity[] = [];

	getValidityCount (): number {
		return this.laneValidities.length;
	}

	getValidity ( i: number ): TvLaneValidity {
		return this.laneValidities[ i ];
	}
}

export class StaticSignal extends TvRoadSignal {

	constructor (
		s: number,
		t: number,
	) {
		super( s, t, TvRoadSignal.counter, 'StaticSignal', TvDynamicTypes.NO, TvOrientation.MINUS );
	}

}

