/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvDynamicTypes, TvOrientation, TvUnit } from '../models/tv-common';
import { TvLaneValidity } from "../models/objects/tv-lane-validity";
import { MathUtils, Object3D } from "three";
import { TvRoad } from '../models/tv-road.model';
import { TvPosTheta } from '../models/tv-pos-theta';

export enum TvSignalType {
	RoadMark = 'roadMark',
	Unknown = 'unknown',
}

export enum TvSignalSubType {
	Text = 'text',
	Unknown = 'unknown',
}

export enum TvSignalDependencyType {
	TrafficLight = 'trafficLight',
	Unknown = 'unknown',
}

export enum TvReferenceElementType {
	Object = 'object',
	Signal = 'signal',
}

export class TvRoadSignal {

	public readonly uuid: string;

	public validities: TvLaneValidity[] = [];

	public dependencies: TvSignalDependency[] = [];

	public references: TvReference[] = [];

	public userData: Map<string, string | number> = new Map<string, string | number>();

	private road: TvRoad;

	public assetGuid: string;

	public mesh: Object3D;

	/**
	 *
	 * @param s
	 * @param t
	 * @param id
	 * @param name
	 * @param dynamic
	 * @param orientation "+" = valid in positive s-direction, "-" = valid in negative s-direction, "none" = valid in both directions
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
		public orientation?: TvOrientation,
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
		this.uuid = MathUtils.generateUUID();
	}

	setRoad ( road: TvRoad ): void {
		this.road = road;
	}

	getRoad (): TvRoad {
		return this.road;
	}

	getPosition (): TvPosTheta {
		const position = this.road.getRoadPosition( this.s, this.t );
		position.z += this.zOffset;
		return position;
	}

	addValidity ( fromLane: number, toLane: number ): void {
		this.validities.push( new TvLaneValidity( fromLane, toLane ) );
	}

	addDependency ( id: number, type: TvSignalDependencyType ) {
		this.dependencies.push( new TvSignalDependency( id, type ) );
	}

	addReference ( elementId: number, elementType: TvReferenceElementType, type?: string ) {
		this.references.push( new TvReference( elementId, elementType, type ) );
	}

	static stringToDynamicType ( value: string ): TvDynamicTypes {
		if ( value === 'yes' ) {
			return TvDynamicTypes.YES;
		} else if ( value === 'no' ) {
			return TvDynamicTypes.NO;
		} else {
			return TvDynamicTypes.NO;
		}
	}

	static stringToOrientation ( value: any ) {
		if ( value === '+' ) {
			return TvOrientation.PLUS;
		} else if ( value === '-' ) {
			return TvOrientation.MINUS;
		} else if ( value === 'none' ) {
			return TvOrientation.NONE;
		} else {
			return TvOrientation.NONE;
		}
	}

	static stringToUnit ( value: string ): TvUnit {
		if ( value === 'm' ) {
			return TvUnit.METER;
		} else if ( value === 'km' ) {
			return TvUnit.KM;
		} else if ( value === 'ft' ) {
			return TvUnit.FEET;
		} else if ( value === 'mile' ) {
			return TvUnit.MILE;
		} else if ( value === 'm/s' ) {
			return TvUnit.METER_PER_SECOND;
		} else if ( value === 'mph' ) {
			return TvUnit.MILES_PER_HOUR;
		} else if ( value === 'km/h' ) {
			return TvUnit.KM_PER_HOUR;
		} else if ( value === 'kg' ) {
			return TvUnit.KG;
		} else if ( value === 't' ) {
			return TvUnit.T;
		} else if ( value === '%' ) {
			return TvUnit.PERCENT;
		} else {
			return TvUnit.NONE;
		}
	}
}

/**
 * Signal dependency means that one signal controls the output of another signal.
 *
 * The signal dependency record provides signals with a means to control other signals. Signs can e.g.
 * restrict other signs for various types of vehicles, warning lights can be turned on when a traffic light
 * goes red etc. The signal dependency record is an optional child record of the signal record. A signal
 * may have multiple dependency records.
 */
export class TvSignalDependency {

	constructor (
		public id: number,
		public type?: TvSignalDependencyType
	) {
	}

}

/**
 * Depending on the way roads (especially in junctions) are laid out for different applications, it may be
 * necessary to refer to the same (i.e. the identical) sign from multiple roads. In order to prevent
 * inconsistencies by multiply defining an entire signal entry, the user only needs to define the complete
 * signal entry once and can refer to this complete record by means of the signal reference record.
 */
export class TvSignalRef {
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

export class TvReference {

	/**
	 * Signal reference means that there is some kind of link between two
	 * signals or objects. A signal reference is valid for one specific signal only.
	 *
	 * An example would be a traffic light which uses a <reference> to a stop
	 * line in order to specify where traffic participants have to stop on red.
	 * The stop line in turn has a <dependency> on the traffic light,
	 * since traffic should stop there only if the traffic light is red.
	 *
	 * @param elementId Unique ID of the linked element
	 * @param elementType Type of the linked element
	 * @param type Type of the linkage Free text, depending on application
	 */
	constructor (
		public elementId: number,
		public elementType: TvReferenceElementType,
		public type?: string
	) {
	}
}
