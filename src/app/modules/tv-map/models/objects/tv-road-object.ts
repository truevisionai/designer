/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Mesh, Object3D } from 'three';
import { ObjectTypes, TvOrientation, TvUserData } from '../tv-common';
import { TvObjectMarking } from '../tv-object-marking';
import { TvRoad } from '../tv-road.model';
import { TvObjectRepeat } from "./tv-object-repeat";
import { TvLaneValidity } from "./tv-lane-validity";
import { TvObjectMaterial } from "./tv-object-material";
import { TvParkingSpace } from "./tv-parking-space";
import { TvObjectOutline } from "./tv-object-outline";

export class TvRoadObject {

	public static counter = 1;
	public road: TvRoad;
	public attr_type: ObjectTypes;
	private attr_s: number;
	private attr_t: number;
	private attr_zOffset: number;
	private attr_validLength: number;
	private attr_orientation: any;
	private attr_length: number;
	private attr_width: number;
	private attr_radius: number;
	private attr_height: number;
	private attr_hdg: number;
	private attr_pitch: number;
	private attr_roll: number;
	private repeat: TvObjectRepeat[] = [];

	public outlines: TvObjectOutline[] = [];
	public material: TvObjectMaterial;
	public validity: TvLaneValidity[] = [];
	public parkingSpace: TvParkingSpace;
	public userData: TvUserData[] = [];
	public name: string;
	private _markings: TvObjectMarking[] = [];

	constructor (
		type: ObjectTypes,
		name: string,
		public attr_id: number,
		s: number,
		t: number,
		zOffset: number = 0,
		validLength: number = 0,
		orientation: TvOrientation = TvOrientation.NONE,
		length: number = null,
		width: number = null,
		radius: number = null,
		height: number = null,
		hdg: number = null,
		pitch: number = null,
		roll: number = null
	) {
		// super();
		TvRoadObject.counter++;
		this.attr_type = type;
		this.name = name;
		this.attr_s = s;
		this.attr_t = t;
		this.attr_zOffset = zOffset;
		this.attr_validLength = validLength;
		this.attr_orientation = orientation;
		this.attr_length = length;
		this.attr_width = width;
		this.attr_radius = radius;
		this.attr_height = height;
		this.attr_hdg = hdg;
		this.attr_pitch = pitch;
		this.attr_roll = roll;
	}

	get markings (): TvObjectMarking[] {
		return this._markings;
	}

	get s (): number {
		return this.attr_s;
	}

	get t (): number {
		return this.attr_t;
	}

	get zOffset (): number {
		return this.attr_zOffset;
	}

	get validLength (): number {
		return this.attr_validLength;
	}

	get orientation (): any {
		return this.attr_orientation;
	}

	get length (): number {
		return this.attr_length;
	}

	set length ( value: number ) {
		this.attr_length = value;
	}

	get width (): number {
		return this.attr_width;
	}

	set width ( value: number ) {
		this.attr_width = value;
	}

	get radius (): number {
		return this.attr_radius;
	}

	get height (): number {
		return this.attr_height;
	}

	set height ( value: number ) {
		this.attr_height = value;
	}

	get hdg (): number {
		return this.attr_hdg;
	}

	set hdg ( value: number ) {
		this.attr_hdg = value;
	}

	get pitch (): number {
		return this.attr_pitch;
	}

	get roll (): number {
		return this.attr_roll;
	}

	getRepeatCount (): number {
		return this.repeat.length;
	}

	getRepeatList (): TvObjectRepeat[] {
		return this.repeat;
	}

	getRepeat ( i: number ): TvObjectRepeat {
		return this.repeat[ i ];
	}

	getValidityCount (): number {
		return this.validity.length;
	}

	getValidityList (): TvLaneValidity[] {
		return this.validity;
	}

	getValidity ( i: number ): TvLaneValidity {
		return this.validity[ i ];
	}

	addRepeat (
		s: number, length: number, distance: number, tStart: number, tEnd: number,
		widthStart: number, widthEnd: number, heightStart: number, heightEnd: number,
		zOffsetStart: number, zOffsetEnd: number
	): void {

		this.repeat.push(
			new TvObjectRepeat( s, length, distance, tStart, tEnd, widthStart, widthEnd, heightStart, heightEnd, zOffsetStart, zOffsetEnd )
		);

	}


	addMarkingObject ( markingObject: TvObjectMarking ): void {
		this._markings.push( markingObject );
	}

	findCornerRoadById ( id: number ) {
		for ( const outline of this.outlines ) {
			for ( const corner of outline.cornerRoad ) {
				if ( corner.attr_id == id ) {
					return corner;
				}
			}
		}
	}

}

