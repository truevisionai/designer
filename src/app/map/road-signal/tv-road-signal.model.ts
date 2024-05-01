/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { SignShapeType } from '../services/tv-sign.service';
import { TvDynamicTypes, TvOrientation, TvUnit } from '../models/tv-common';
import { TvUserData } from '../models/tv-user-data';
import { TvRoad } from '../models/tv-road.model';
import { TvLaneValidity } from "../models/objects/tv-lane-validity";

export enum TvSignalType {
	RoadMark = 'roadMark',
	Unknown = 'unknown',
}

export enum TvSignalSubType {
	Text = 'text',
	Unknown = 'unknown',
}

export class TvRoadSignal {

	public static counter = 1;

	public validities: TvLaneValidity[] = [];
	public dependencies: TvSignalDependency[] = [];
	public signalReferences: TvSignalReference[] = [];
	public roadId: number;
	public assetGuid: string;

	/**
	 *
	 * @param s
	 * @param t
	 * @param id
	 * @param name
	 * @param dynamic
	 * @param orientation "+" = valid in positive s- direction, "-" = valid in negative s- direction, "none" = valid in both directions
	 * @param zOffset z offset from the road to bottom edge of the signal. This represents the vertical clearance of the object. Relative to the reference line.
	 * @param country
	 * @param type Type identifier according to country code or "-1" / "none". See extra document.
	 * @param subtype Subtype identifier according to country code or "-1" / "none"
	 * @param value Value of the signal, if value is given, unit is mandatory
	 * @param unit Unit of @value
	 * @param height Height of the signal, measured from bottom edge of the signal
	 * @param width Width of the signal
	 * @param text Additional text associated with the signal, for example, text on city limit "City\nBadAibling"
	 * @param hOffset Heading offset of the signal (relative to @orientation, if orientation is equal to “+” or “-“) Heading offset of the signal (relative to reference line, if orientation is equal to “none”
	 * @param pitch
	 * @param roll
	 */
	constructor (
		public s: number,
		public t: number,
		public id: number,
		public name: string,
		public dynamic?: TvDynamicTypes,
		public orientations?: TvOrientation,
		public zOffset?: number,
		public country?: string,
		public type?: string,
		public subtype?: string,
		public value?: number,
		public unit: TvUnit = TvUnit.NONE,
		public height: number = 0,
		public width: number = 0,
		public text: string = '',
		public hOffset: number = 0,
		public pitch: number = 0,
		public roll: number = 0
	) {

		TvRoadSignal.counter++;

	}

	private _userData: Map<string, TvUserData> = new Map<string, TvUserData>();

	set userData ( values: TvUserData[] ) {
		values.forEach( data => this._userData.set( data.attr_code, data ) );
	}

	get userDataMap () {
		return this._userData;
	}

	get assetName () {
		return this._userData.get( 'asset_name' );
	}

	getRoad (): TvRoad {
		throw new Error( 'method not implemented' );
		// return TvMapQueries.findRoadById( this.roadId );
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
		// this.gameObject?.position.copy( position );
		// this.controlPoint?.position.copy( position );
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

