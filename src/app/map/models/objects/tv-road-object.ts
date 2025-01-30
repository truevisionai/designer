/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvOrientation } from '../tv-common';
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
import { Euler, MathUtils, Object3D, Quaternion, Vector3 } from "three";
import { TvCornerRoad } from './tv-corner-road';
import { Maths } from 'app/utils/maths';
import { TvPosTheta } from '../tv-pos-theta';

export enum TvRoadObjectType {

	// A barrier is a continuous roadside object, which cannot be passed.
	barrier = 'barrier',

	// A building is a closed object, which cannot be passed.
	building = 'building',

	// A crosswalk is an object on the road that can be passed.
	// It is recommended to be defined as <crossPath> within a junction for pedestrian/bicycle simulation.
	//If the crosswalk is defined as an object only, it will not be used for pedestrian/bicycle simulation
	crosswalk = 'crosswalk',

	// A gantry is an object above a road on which <signals> are placed.
	gantry = 'gantry',

	// An obstacle is an object on or beside the road that cannot be passed.
	obstacle = 'obstacle',

	// A parkingSpace is an object on a lane on which vehicles are parked.
	parkingSpace = 'parkingSpace',

	// A pole is a thin long object.
	pole = 'pole',

	// A roadMark object is painted on the road and can be passed.
	roadMark = 'roadMark',

	// A roadSurface object is on the road and can be passed.
	// new in 1.8
	roadSurface = 'roadSurface',

	// A trafficIsland object is on the road and should not be passed by vehicles.
	trafficIsland = 'trafficIsland',

	// A tree object is a single vegetational object with a trunk.
	tree = 'tree',

	// A vegetation object is a single vegetational object without a trunk or an area of vegetation.
	vegetation = 'vegetation',

	// All other objects, that don’t fit into existing categories or unknown.
	none = 'none',

	// deprecated all below
	patch = 'patch',
	motorbike = 'motorbike',
	pedestrian = 'pedestrian',
	railing = 'railing',
	soundBarrier = 'soundBarrier',
	streetLamp = 'streetLamp',
	trailer = 'trailer',
	train = 'train',
	tram = 'tram',
	van = 'van',
	wind = 'wind',
	bus = 'bus',
	bike = 'bike',
	car = 'car',
	ROAD = 'ROAD',
	LANE = 'LANE',
	LANE_MARKING = 'LANE_MARKING',
	VEHICLE = 'vehicle',
}

export enum TvRoadMarkObjectType {
	arrowLeft,
	arrowLeftLeft,
	arrowLeftRight,
	arrowRight,
	arrowRightRight,
	arrowRightLeft,
	arrowStraight,
	arrowStraightLeft,
	arrowStraightRight,
	arrowStraightLeftRight,
	arrowMergeLeft,
	arrowMergeRight,
	signalLines, // these are referenced by a signal
	text, // for example, YIELD or 50, might be referenced by a signal
	symbol, // for example, Wheelchair or bicycle
	paint,
	area, // for example, restricted area, keep clear area
	other, // all other roadMark objects subtypes that do not fit into current categories
}

export class TvRoadObject {

	public static counter = 1;

	public readonly id: number;

	public readonly uuid: string;

	public road: TvRoad;

	public mesh: Object3D;

	public attr_type: TvRoadObjectType;

	public subType: string;

	public outlines: TvObjectOutline[] = [];

	public material: TvObjectMaterial;

	public validity: TvLaneValidity[] = [];

	public parkingSpace: TvParkingSpace;

	public userData: TvUserData[] = [];

	public name: string;

	public assetGuid: string;

	public skeleton?: TvRoadObjectSkeleton;

	public s: number;

	public t: number;

	public zOffset: number;

	public validLength: number;

	public orientation: TvOrientation;

	public length: number;

	public width: number;

	public radius: number;

	public height: number;

	public hdg: number;

	public pitch: number;

	public roll: number;

	private repeat: TvObjectRepeat[] = [];

	private _markings: TvObjectMarking[] = [];

	get repeats (): TvObjectRepeat[] {
		return this.repeat;
	}

	/**
	 *
	 * @param type
	 * @param name
	 * @param id
	 * @param s
	 * @param t
	 * @param zOffset z-offset of object’s origin relative to the elevation of the road reference line
	 * @param validLength Validity of object along s-axis (0.0 for point object)
	 * @param orientation
	 * @param length Length of the object’s bounding box, alternative to @radius. @length is defined in the local coordinate system u/v along the u-axis
	 * @param width Width of the object’s bounding box, alternative to @radius. @width is defined in the local coordinate system u/v along the v-axis
	 * @param radius radius of the circular object’s bounding box, alternative to @length and @width. @radius is defined in the local coordinate system u/v
	 * @param height Height of the object’s bounding box. @height is defined in the local coordinate system u/v along the z-axis
	 * @param hdg Heading angle of the object relative to road direction
	 * @param pitch Pitch angle relative to the x/y-plane
	 * @param roll Roll angle relative to the x/y-plane
	 */
	constructor (
		type: TvRoadObjectType,
		name: string,
		id: number,
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
		TvRoadObject.counter++;
		this.uuid = MathUtils.generateUUID();
		this.id = id;
		this.attr_type = type;
		this.name = name;
		this.s = s;
		this.t = t;
		this.zOffset = zOffset;
		this.validLength = validLength;
		this.orientation = orientation;
		this.length = length;
		this.width = width;
		this.radius = radius;
		this.height = height;
		this.hdg = hdg;
		this.pitch = pitch;
		this.roll = roll;
	}

	get markings (): TvObjectMarking[] {
		return this._markings;
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

	getOutlineCount (): number {
		return this.outlines.length;
	}

	getOutlines (): TvObjectOutline[] {
		return this.outlines;
	}

	addRepeat (
		s: number,
		length: number,
		distance: number,
		tStart?: number, tEnd?: number,
		widthStart?: number, widthEnd?: number,
		heightStart?: number, heightEnd?: number,
		zOffsetStart?: number, zOffsetEnd?: number
	): TvObjectRepeat {

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
	): TvObjectRepeat {

		const object = new TvObjectRepeat( s, length, distance, tStart, tEnd, widthStart, widthEnd, heightStart, heightEnd, zOffsetStart, zOffsetEnd );

		object.targetLane = lane;

		this.addRepeatObject( object );

		return object;
	}

	addRepeatObject ( repeat: TvObjectRepeat ): void {

		this.repeat.push( repeat );

	}

	removeRepeatObject ( repeat: TvObjectRepeat ): void {

		this.repeat = this.repeat.filter( r => r !== repeat );

	}

	addMarkingObject ( markingObject: TvObjectMarking ): void {
		this._markings.push( markingObject );
	}

	findCornerRoadById ( id: number ): TvCornerRoad {
		for ( const outline of this.outlines ) {
			for ( const corner of outline.cornerRoads ) {
				if ( corner.attr_id == id ) {
					return corner;
				}
			}
		}
	}

	isRoadMarking (): boolean {
		return this.attr_type == TvRoadObjectType.roadMark;
	}

	toOrientationString (): string {

		switch ( this.orientation ) {

			case TvOrientation.NONE:
				return 'none';

			case TvOrientation.PLUS:
				return 'left';

			case TvOrientation.MINUS:
				return 'right';

			default:
				return 'none';

		}

	}

	static orientationFromString ( orientation: string ): TvOrientation {

		switch ( orientation?.toLowerCase().trim() ) {

			case 'none':
				return TvOrientation.NONE;

			case 'left':
				return TvOrientation.PLUS;

			case 'right':
				return TvOrientation.MINUS;

			default:
				return TvOrientation.NONE;

		}

	}

	clone ( id?: number ): TvRoadObject {

		const object = new TvRoadObject(
			this.attr_type,
			this.name,
			id || this.id,
			this.s,
			this.t,
			this.zOffset,
			this.validLength,
			this.orientation,
			this.length,
			this.width,
			this.radius,
			this.height,
			this.hdg,
			this.pitch,
			this.roll
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

	getObjectHeading (): number {

		const roadCoord = this.road.getRoadPosition( this.s, this.t );

		let hdg: number;

		if ( this.orientation === TvOrientation.PLUS ) {

			hdg = this.hdg + roadCoord.hdg - Maths.PI2;

		} else if ( this.orientation === TvOrientation.MINUS ) {

			hdg = this.hdg + roadCoord.hdg + Maths.PI2;

		} else {

			hdg = roadCoord.hdg;

		}

		return hdg;

	}

	updateRoadCoordinates ( s: number, t: number ): void {

		this.s = s;
		this.t = t;

	}

	setPosition ( position: Vector3 ): void {

		const coord = this.road.getRoadCoordinatesAt( position );

		this.updateRoadCoordinates( coord.s, coord.t );

	}

	getPosition (): Vector3 {

		return this.getObjectPosition().toVector3();

	}

	getObjectPosition (): TvPosTheta {

		return this.road.getRoadPosition( this.s, this.t );

	}

	getObjectRotation (): Euler {

		const heading = this.getObjectHeading();

		const rotation = new Euler( 0, 0, 0 );

		const surfaceNormal = this.road.getSurfaceNormal( this.s, this.t );

		// Align the rotation to the surface normal
		// Against default decal orientation
		// Assuming decals face +Z by default
		rotation.setFromQuaternion( new Quaternion().setFromUnitVectors( new Vector3( 0, 0, 1 ), surfaceNormal ) );

		rotation.x += this.pitch || 0;

		rotation.y += this.roll || 0;

		rotation.z += heading;

		return rotation;
	}

	toString (): string {
		return `RoadObject:${ this.id } Name:${ this.name }  Type:${ this.attr_type } S:${ this.s } T:${ this.t }`;
	}

	static typeToString ( type: TvRoadObjectType ): string {

		switch ( type ) {

			case TvRoadObjectType.barrier:
				return 'barrier';

			case TvRoadObjectType.building:
				return 'building';

			case TvRoadObjectType.crosswalk:
				return 'crosswalk';

			case TvRoadObjectType.gantry:
				return 'gantry';

			case TvRoadObjectType.obstacle:
				return 'obstacle';

			case TvRoadObjectType.parkingSpace:
				return 'parkingSpace';

			case TvRoadObjectType.pole:
				return 'pole';

			case TvRoadObjectType.roadMark:
				return 'roadMark';

			case TvRoadObjectType.roadSurface:
				return 'roadSurface';

			case TvRoadObjectType.trafficIsland:
				return 'trafficIsland';

			case TvRoadObjectType.tree:
				return 'tree';

			case TvRoadObjectType.vegetation:
				return 'vegetation';

			case TvRoadObjectType.none:
				return 'none';

			default:
				return 'none';
		}

	}

	static stringToType ( value: string ): TvRoadObjectType {

		switch ( value ) {

			case 'barrier':
				return TvRoadObjectType.barrier;

			case 'building':
				return TvRoadObjectType.building;

			case 'crosswalk':
				return TvRoadObjectType.crosswalk;

			case 'gantry':
				return TvRoadObjectType.gantry;

			case 'obstacle':
				return TvRoadObjectType.obstacle;

			case 'parkingSpace':
				return TvRoadObjectType.parkingSpace;

			case 'pole':
				return TvRoadObjectType.pole;

			case 'roadMark':
				return TvRoadObjectType.roadMark;

			case 'roadSurface':
				return TvRoadObjectType.roadSurface;

			case 'trafficIsland':
				return TvRoadObjectType.trafficIsland;

			case 'tree':
				return TvRoadObjectType.tree;

			case 'vegetation':
				return TvRoadObjectType.vegetation;

			case 'none':
				return TvRoadObjectType.none;

			default:
				return TvRoadObjectType.none;

		}

	}
}

