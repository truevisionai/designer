/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ObjectTypes, TvOrientation } from '../tv-common';
import { TvUserData } from '../tv-user-data';
import { TvObjectMarking } from '../tv-object-marking';
import { TvRoad } from '../tv-road.model';
import { TvObjectRepeat } from "./tv-object-repeat";
import { TvLaneValidity } from "./tv-lane-validity";
import { TvObjectMaterial } from "./tv-object-material";
import { TvParkingSpace } from "./tv-parking-space";
import { TvObjectOutline } from "./tv-object-outline";
import { TvLane } from '../tv-lane';
import { TvRoadObjectSkeleton } from "./tv-road-object-skeleton";
import { Euler, Object3D, Vector3 } from 'three';

export class TvRoadObject {

	public static counter = 1;

	public road: TvRoad;

	public mesh: Object3D;

	public attr_type: ObjectTypes;

	public subType: string;

	public outlines: TvObjectOutline[] = [];

	public material: TvObjectMaterial;

	public validity: TvLaneValidity[] = [];

	public parkingSpace: TvParkingSpace;

	public userData: TvUserData[] = [];

	public name: string;

	public assetGuid: string;

	public skeleton?: TvRoadObjectSkeleton;

	private attr_s: number;

	private attr_t: number;

	private attr_zOffset: number;

	private attr_validLength: number;

	private attr_orientation: TvOrientation;

	private attr_length: number;

	private attr_width: number;

	private attr_radius: number;

	private attr_height: number;

	private attr_hdg: number;

	private attr_pitch: number;

	private attr_roll: number;

	private repeat: TvObjectRepeat[] = [];

	private _markings: TvObjectMarking[] = [];

	get repeats (): TvObjectRepeat[] {
		return this.repeat;
	}

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

	set s ( value: number ) {
		this.attr_s = value;
	}

	get t (): number {
		return this.attr_t;
	}

	set t ( value: number ) {
		this.attr_t = value;
	}

	get zOffset (): number {
		return this.attr_zOffset;
	}

	set zOffset ( value: number ) {
		this.attr_zOffset = value;
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

	set radius ( value: number ) {
		this.attr_radius = value;
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

	set pitch ( value: number ) {
		this.attr_pitch = value;
	}

	get roll (): number {
		return this.attr_roll;
	}

	set roll ( value: number ) {
		this.attr_roll = value;
	}

	get scale (): Vector3 {
		return new Vector3( this.width || 0, this.height || 0, this.length || 0 );
	}

	set scale ( value: Vector3 ) {
		this.width = value.x;
		this.height = value.y;
		this.length = value.z;
	}

	get rotation (): Euler {
		return new Euler( this.hdg || 0, this.pitch || 0, this.roll || 0 );
	}

	set rotation ( value: Vector3 | Euler ) {
		this.hdg = value.x;
		this.pitch = value.y;
		this.roll = value.z;
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

	addRepeat (
		s: number,
		length: number,
		distance: number,
		tStart?: number, tEnd?: number,
		widthStart?: number, widthEnd?: number,
		heightStart?: number, heightEnd?: number,
		zOffsetStart?: number, zOffsetEnd?: number
	) {

		const object = new TvObjectRepeat( s, length, distance, tStart, tEnd, widthStart, widthEnd, heightStart, heightEnd, zOffsetStart, zOffsetEnd );

		this.addRepeatObject( object );

		return object;
	}

	addLaneRepeat (
		lane: TvLane,
		s: number,
		length: number,
		distance: number,
		tStart?: number, tEnd?: number,
		widthStart?: number, widthEnd?: number,
		heightStart?: number, heightEnd?: number,
		zOffsetStart?: number, zOffsetEnd?: number
	) {

		const object = new TvObjectRepeat( s, length, distance, tStart, tEnd, widthStart, widthEnd, heightStart, heightEnd, zOffsetStart, zOffsetEnd );

		object.targetLane = lane;

		this.addRepeatObject( object );

		return object;
	}

	addRepeatObject ( repeat: TvObjectRepeat ): void {

		this.repeat.push( repeat );

	}

	removeRepeatObject ( repeat: TvObjectRepeat ) {

		this.repeat = this.repeat.filter( r => r !== repeat );

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

	toOrientationString (): string {

		switch ( this.attr_orientation ) {

			case TvOrientation.NONE: return 'none';

			case TvOrientation.PLUS: return 'left';

			case TvOrientation.MINUS: return 'right';

			default: return 'none';

		}

	}

	static orientationFromString ( orientation: string ): TvOrientation {

		switch ( orientation.toLowerCase().trim() ) {

			case 'none': return TvOrientation.NONE;

			case 'left': return TvOrientation.PLUS;

			case 'right': return TvOrientation.MINUS;

			default: return TvOrientation.NONE;

		}

	}


	clone ( id?: number ): TvRoadObject {

		const object = new TvRoadObject(
			this.attr_type,
			this.name,
			id || this.attr_id,
			this.attr_s,
			this.attr_t,
			this.attr_zOffset,
			this.attr_validLength,
			this.attr_orientation,
			this.attr_length,
			this.attr_width,
			this.attr_radius,
			this.attr_height,
			this.attr_hdg,
			this.attr_pitch,
			this.attr_roll
		);

		object.road = this.road;
		object.assetGuid = this.assetGuid;
		object.subType = this.subType;
		object.material = this.material?.clone();
		object.parkingSpace = this.parkingSpace?.clone();
		object.repeat = this.repeat.map( repeat => repeat.clone() );
		object.validity = this.validity.map( validity => validity.clone() );
		object.outlines = this.outlines.map( outline => outline.clone() );
		object.userData = this.userData.map( userData => userData.clone() );
		object.skeleton = this.skeleton?.clone();
		object._markings = this.markings.map( marking => marking.clone() );

		return object;

	}

}

