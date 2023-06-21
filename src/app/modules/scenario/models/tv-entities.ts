/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BoxGeometry, Euler, MeshBasicMaterial, Vector3 } from 'three';
import { GameObject } from '../../../core/game-object';
import { Time } from '../../../core/time';
import { Maths } from '../../../utils/maths';
import { TvLaneType } from '../../tv-map/models/tv-common';
import { TvMapInstance } from '../../tv-map/services/tv-map-source-file';
import { DefaultVehicleController } from '../controllers/vehicle-controller';
import { AbstractController } from './abstract-controller';
import { PrivateAction } from './private-action';
import { CatalogReference } from './tv-catalogs';
import { ScenarioObjectType } from './tv-enums';
import { Orientation } from './tv-orientation';

export class EntityObject {

	private static count = 1;

	public gameObject: GameObject;
	public type: ScenarioObjectType;
	// OSCMiscObject

	public initActions: PrivateAction[] = [];
	// OSCPedestrian
	public catalogReference: CatalogReference;
	public sCoordinate: number;
	// OSCVehicle
	public tCoordinate: number;
	public automove: boolean = true;
	public direction: number = 1;
	// OSCPedestrianController
	public controller: AbstractController;
	public distanceTravelled = 0;

	constructor ( name: string, gameObject: GameObject = null, controller: AbstractController = null ) {

		this.name = name;

		if ( !gameObject ) {

			const geometry = new BoxGeometry( 2.0, 4.2, 1.6 );
			const material = new MeshBasicMaterial( { color: Math.random() * 0xffffff } );
			this.gameObject = new GameObject( name, geometry, material );
			this.gameObject.userData.entity = this;
		}

		this.controller = controller || new DefaultVehicleController( TvMapInstance.map, this );

		EntityObject.count++;
	}

	// OSCDriver
	private _name: string;

	get name (): string {
		return this._name;
	}

	set name ( value: string ) {
		this._name = value;
	}

	private _speed = 0;

	get speed (): number {
		return this._speed;
	}

	set speed ( value: number ) {
		this._speed = value;
	}

	private _roadId: number;

	get roadId (): number {

		return this._roadId;

	}

	set roadId ( value: number ) {

		this._roadId = value;

	}

	private _laneSectionId: number;

	// OSCCatalogReference

	get laneSectionId (): number {

		return this._laneSectionId;

	}

	set laneSectionId ( value: number ) {

		this._laneSectionId = value;
		// console.info( 'lane-section-changed', this.roadId, this.laneSectionId, this.laneId, this.sCoordinate );

	}

	// OSCCatalogReference
	private _laneId: number;

	get laneId (): number {

		return this._laneId;

	}

	set laneId ( value: number ) {

		this._laneId = value;

	}

	private _laneOffset: number = 0;

	get laneOffset (): number {

		return this._laneOffset;

	}

	set laneOffset ( value: number ) {

		this._laneOffset = value;

	}

	private _hdg: number = 0;

	get hdg (): number {

		return this._hdg;

	}

	set hdg ( value: number ) {

		this._hdg = value;

	}

	private _maxSpeed: number;

	get maxSpeed (): number {

		return this._maxSpeed;

	}

	set maxSpeed ( value: number ) {

		this._speed = value;
		this._maxSpeed = value;

	}

	private _enabled: boolean = true;

	get enabled (): boolean {

		return this._enabled;

	}

	set enabled ( value: boolean ) {

		this._enabled = value;

	}

	get position (): Vector3 {
		return this.gameObject.position;
	}

	static getNewName ( name = 'Player' ) {

		return `${ name }${ this.count }`;

	}

	setPosition ( position: Vector3 ) {

		this.gameObject.position.copy( position );

	}

	addInitAction ( action: PrivateAction ) {

		this.initActions.push( action );

	}

	// TODO: fix thes value sare not workifn for accel
	private previousVelocity = 0;
	private currentVelocity = 0;
	private acceleration = 0;
	private originalPosition: Vector3;

	update () {

		if ( !this.automove && !this.enabled ) return;

		if ( !this.originalPosition ) this.originalPosition = this.position.clone();

		const previousPosition = this.position.clone();

		this.previousVelocity = this.speed;

		this.controller.update();

		this.currentVelocity = this.speed;

		this.acceleration = ( this.currentVelocity - this.previousVelocity ) / Time.fixedDeltaTime;

		const newPosition = this.position.clone();

		const distanceTravelled = previousPosition.distanceTo( newPosition );

		this.distanceTravelled += distanceTravelled;

	}

	enable () {

		this.enabled = true;

		this.gameObject.visible = true;

	}

	disable () {

		this.enabled = false;

		this.gameObject.visible = false;

	}

	getCurrentSpeed () {

		return this.speed;

	}

	updateSpeed ( newSpeed: number ) {

		this.speed = newSpeed;

	}

	getCurrentLaneId () {

		return this.laneId;

	}

	getCurrentPosition () {

		return this.position;

	}

	getCurrentLaneOffset () {

		return this.laneOffset;

	}

	setLaneOffset ( newLaneOffset ) {

		this.laneOffset = newLaneOffset;

	}

	isOffRoad () {

		// TODO can be imrpved

		const road = TvMapInstance.map.getRoadById( this.roadId );
		const laneSection = road.getLaneSectionById( this.laneSectionId );
		const lane = laneSection.getLaneById( this.laneId );

		if (
			lane.type == TvLaneType.driving ||
			lane.type == TvLaneType.stop ||
			lane.type == TvLaneType.parking
		) {

			return false;

		} else {

			return true;

		}
	}

	isAtEndOfRoad () {

		const road = TvMapInstance.map.getRoadById( this.roadId );

		// either at the end of the road
		// or at the beginning
		if (
			this.sCoordinate >= road.length - Maths.Epsilon ||
			this.sCoordinate <= Maths.Epsilon
		) {

			return true;

		} else {

			return false;

		}


	}

	getCurrentAcceleration () {

		return this.acceleration;

	}

	reset () {

		this.distanceTravelled = 0;
		this._speed = 0;
		this.acceleration = 0;
		this.previousVelocity = 0;
		this.currentVelocity = 0;
		this._maxSpeed = 0;
		this.laneOffset = 0;

		if ( this.originalPosition ) {
			this.setPosition( this.originalPosition );
			this.originalPosition = null;
		}

	}

	setEuler ( value: Euler ) {

		this.gameObject.rotation.copy( value );

	}

	getEuler (): Euler {

		return this.gameObject.rotation;

	}

	getOrientation (): Orientation {

		return new Orientation(
			this.gameObject.rotation.x,
			this.gameObject.rotation.y,
			this.gameObject.rotation.z,
		);

	}
}

