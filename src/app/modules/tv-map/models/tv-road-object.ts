/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { Mesh, Object3D, Vector3 } from 'three';
import {
	ObjectFillType,
	ObjectTypes,
	TvBridgeTypes,
	TvColors,
	TvLaneType,
	TvOrientation,
	TvParkingSpaceAccess,
	TvParkingSpaceMarkingSides,
	TvRoadMarkTypes,
	TvTunnelTypes,
	TvUserData
} from './tv-common';
import { TvObjectMarking } from './tv-object-marking';
import { TvRoad } from './tv-road.model';

export class TvObjectContainer {
	public object: TvRoadObject[] = [];
	public objectReference: TvRoadObjectReference[] = [];
	public tunnel: TvRoadTunnel[] = [];
	public bridge: TvRoadBridge[] = [];
}

export class TvRoadObject extends Object3D {
	public static counter = 1;
	public road: TvRoad;
	public attr_type: ObjectTypes;
	public attr_s: number;
	public attr_t: number;
	public attr_zOffset: number;
	public attr_validLength: number;
	public attr_orientation: any;
	public attr_length: number;
	public attr_width: number;
	public attr_radius: number;
	public attr_height: number;
	public attr_hdg: number;
	public attr_pitch: number;
	public attr_roll: number;
	public repeat: TvObjectRepeat[] = [];
	/**
	 * @deprecated
	 */
	public outline: TvObjectOutline;
	// multiple outlines are allowed
	public outlines: TvObjectOutline[] = [];
	public material: TvObjectMaterial;
	public validity: TvLaneValidity[] = [];
	public parkingSpace: TvParkingSpace;
	public userData: TvUserData[] = [];
	public mesh: Mesh;
	// public gameObject: Object3D;
	private lastAddedRepeatObjectIndex: number;

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
		super();
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

	protected _markings: TvObjectMarking[] = [];

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

	get width (): number {
		return this.attr_width;
	}

	get radius (): number {
		return this.attr_radius;
	}

	get height (): number {
		return this.attr_height;
	}

	get hdg (): number {
		return this.attr_hdg;
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

		this.lastAddedRepeatObjectIndex = this.repeat.length - 1;

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

export class TvObjectOutline {

	public cornerRoad: TvCornerRoad[] = [];
	public cornerLocal: TvCornerLocal[] = [];

	public id: number;

	constructor (
		public fillType: ObjectFillType = ObjectFillType.none,
		public outer: boolean = false,
		public closed: boolean = false,
		public laneType: TvLaneType = TvLaneType.none,
	) {
	}

	addCornerRoad ( road: TvRoad, s: number, t: number, dz: number = 0, height: number = 0, id?: number ): TvCornerRoad {
		const cornerRoad = new TvCornerRoad( id || this.cornerRoad.length, road, s, t, dz, height );
		this.cornerRoad.push( cornerRoad );
		return cornerRoad;
	}

	getCornerLocal ( i: number ): TvCornerLocal {
		return this.cornerLocal[ i ];
	}

	getCornerLocalCount (): number {
		return this.cornerLocal.length;
	}

	getCornerRoad ( i: number ): TvCornerRoad {
		return this.cornerRoad[ i ];
	}

	getCornerRoadCount (): number {
		return this.cornerRoad.length;
	}

	removeCornerRoad ( tvCornerRoad: TvCornerRoad ) {

		const index = this.cornerRoad.indexOf( tvCornerRoad );

		if ( index > -1 ) {
			this.cornerRoad.splice( index, 1 );
		}
	}

}

export class TvParkingSpace {
	public attr_access: TvParkingSpaceAccess;
	public attr_restriction: string;

	// MAX 4 ENTRIES ALLOWED
	public marking: TvParkingSpaceMarking[] = [];

	getMarkingCount (): number {
		return this.marking.length;
	}

	getMarkingList (): TvParkingSpaceMarking[] {
		return this.marking;
	}

	getMarking ( i: number ): TvParkingSpaceMarking {
		return this.marking[ i ];
	}
}

export class TvParkingSpaceMarking {
	public attr_side: TvParkingSpaceMarkingSides;
	public attr_type: TvRoadMarkTypes;
	public attr_width: number;
	public attr_color: TvColors;
}

/**
 * For objects like patches which are within the road surface (and, typically, coplanar to the surface) and
 * which represent a local deviation from the standard road material, a description of the material
 * properties is required. This description supercedes the one provided by the Road Material record and,
 * again, is valid only within the outline of the parent road object.
 */
export class TvObjectMaterial {
	public attr_surface: string;
	public attr_friction: number;
	public attr_roughness: number;
}

/**
 * Defines a corner point on the object’s outline in road co-ordinates..
 */
export class TvCornerRoad extends DynamicControlPoint<Crosswalk> {
	constructor (
		public attr_id: number,
		public road: TvRoad,
		public s: number,
		public t: number,
		public dz: number = 0,
		public height: number = 0
	) {
		super( null, road.getPositionAt( s, t ).toVector3() );
	}

	copyPosition ( position: Vector3 ): void {

		super.copyPosition( position );

		const coord = this.road?.getCoordAt( position );

		if ( coord ) this.s = coord.s;

		if ( coord ) this.t = coord.t;

		this.mainObject?.update();

	}
}

/**
 * Defines a corner point on the object’s outline relative to the object's pivot point in local u/v coordinates.
 * The pivot point and the orientation of the object are given by the s/t/heading arguments
 * of the <object> entry.
 */
export class TvCornerLocal {
	public attr_u: number;
	public attr_v: number;
	public attr_z: number;

	// height of the object at this corner
	public attr_height: number;
}

export class TvObjectRepeat {

	public attr_s: number;
	public attr_length: number;
	public attr_distance: number;
	public attr_tStart: number;
	public attr_tEnd: number;
	public attr_widthStart: number;
	public attr_widthEnd: number;
	public attr_heightStart: number;
	public attr_heightEnd: number;
	public attr_zOffsetStart: number;
	public attr_zOffsetEnd: number;

	constructor ( s: number, length: number, distance: number, tStart: number, tEnd: number,
				  widthStart: number, widthEnd: number, heightStart: number, heightEnd: number,
				  zOffsetStart: number, zOffsetEnd: number ) {

		this.attr_s = s;
		this.attr_length = length;
		this.attr_distance = distance;
		this.attr_tStart = tStart;
		this.attr_tEnd = tEnd;
		this.attr_widthStart = widthStart;
		this.attr_widthEnd = widthEnd;
		this.attr_heightStart = heightStart;
		this.attr_heightEnd = heightEnd;
		this.attr_zOffsetStart = zOffsetStart;
		this.attr_zOffsetEnd = zOffsetEnd;

	}

	get s (): number {
		return this.attr_s;
	}

	set s ( value: number ) {
		this.attr_s = value;
	}

	get length (): number {
		return this.attr_length;
	}

	set length ( value: number ) {
		this.attr_length = value;
	}

	get distance (): number {
		return this.attr_distance;
	}

	set distance ( value: number ) {
		this.attr_distance = value;
	}

	get tStart (): number {
		return this.attr_tStart;
	}

	set tStart ( value: number ) {
		this.attr_tStart = value;
	}

	get tEnd (): number {
		return this.attr_tEnd;
	}

	set tEnd ( value: number ) {
		this.attr_tEnd = value;
	}

	get widthStart (): number {
		return this.attr_widthStart;
	}

	set widthStart ( value: number ) {
		this.attr_widthStart = value;
	}

	get widthEnd (): number {
		return this.attr_widthEnd;
	}

	set widthEnd ( value: number ) {
		this.attr_widthEnd = value;
	}

	get heightStart (): number {
		return this.attr_heightStart;
	}

	set heightStart ( value: number ) {
		this.attr_heightStart = value;
	}

	get heightEnd (): number {
		return this.attr_heightEnd;
	}

	set heightEnd ( value: number ) {
		this.attr_heightEnd = value;
	}

	get zOffsetStart (): number {
		return this.attr_zOffsetStart;
	}

	set zOffsetStart ( value: number ) {
		this.attr_zOffsetStart = value;
	}

	get zOffsetEnd (): number {
		return this.attr_zOffsetEnd;
	}

	set zOffsetEnd ( value: number ) {
		this.attr_zOffsetEnd = value;
	}
}

export class TvRoadObjectReference {

	public attr_s;
	public attr_t;
	public attr_id;
	public attr_zOffset;
	public attr_validLength;
	public attr_orientation;

	public validity: TvLaneValidity[] = [];
}

// The tunnel record is – like an object record – applied to the entire cross
// section of the road within the given range unless a lane validity record with
// further restrictions is provided as child record
export class TvRoadTunnel {

	public attr_s: number;
	public attr_length: number;
	public attr_name: string;
	public attr_id: string;
	public attr_type: TvTunnelTypes;

	// degree of artificial tunnel lighting
	public attr_lighting: number;

	// degree of daylight intruding the tunnel
	public attr_daylight: number;

	public validity: TvLaneValidity[] = [];

}

export class TvRoadBridge {

	public attr_s: number;
	public attr_length: number;
	public attr_name: string;
	public attr_id: string;
	public attr_type: TvBridgeTypes;

	public validity: TvLaneValidity[] = [];
}

export class TvLaneValidity {

	// NOTE: For single-lane-validity of the object, provide identical values for fromLane and toLane.

	// minimum ID of the lanes for which the object is valid
	public attr_fromLane: number;

	// maximum ID of the lanes for which the object is valid
	public attr_toLane: number;

	constructor ( from: number, to: number ) {
		this.attr_fromLane = from;
		this.attr_toLane = to;
	}
}

export class Crosswalk extends TvRoadObject {

	constructor (
		s: number,
		t: number,
		markings = [ new TvObjectMarking() ],
		outlines = [ new TvObjectOutline() ]
	) {

		super( ObjectTypes.crosswalk, 'crosswalk', TvRoadObject.counter++, s, t );

		outlines.forEach( outline => outline.cornerRoad.forEach( cornerRoad => {

			cornerRoad.mainObject = this;

			this.add( cornerRoad );

		} ) );

		this.outlines = outlines;

		if ( !markings.length ) markings.push( new TvObjectMarking() );

		markings.map( marking => marking.roadObject = this );

		this._markings = markings;

		this.update();
	}

	get marking () {

		return this.markings[ 0 ];

	}

	update () {

		if ( this.marking.cornerReferences.length < 2 ) return;

		this.marking.update();

	}

	addCornerRoad ( cornerRoad: TvCornerRoad ) {

		cornerRoad.mainObject = this;

		this.marking.addCornerRoad( cornerRoad );

		this.outlines[ 0 ].cornerRoad.push( cornerRoad );

		this.add( cornerRoad );

		this.update();

	}


	removeCornerRoad ( cornerRoad: TvCornerRoad ) {

		this.marking.removeCornerRoad( cornerRoad );

		this.outlines[ 0 ].removeCornerRoad( cornerRoad );

		this.remove( cornerRoad );

		this.update();

	}

}
