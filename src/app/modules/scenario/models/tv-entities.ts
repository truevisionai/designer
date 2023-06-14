/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { GameObject } from '../../../core/game-object';
import { TvMapInstance } from '../../tv-map/services/tv-map-source-file';
import { DefaultVehicleController } from '../controllers/vehicle-controller';
import { AbstractController } from './abstract-controller';
import { AbstractPrivateAction } from './abstract-private-action';
import { SpeedAction } from './actions/tv-speed-action';
import { CatalogReference } from './tv-catalogs';
import { ObjectType } from './tv-enums';
import { IScenarioObject } from './tv-interfaces';

export class EntityObject {

	private static count = 1;

	public gameObject: GameObject;
	public type: ObjectType;
	// OSCMiscObject
	public object: IScenarioObject;

	public initActions: AbstractPrivateAction[] = [];
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

	constructor ( name: string, object: IScenarioObject = null, controller: AbstractController = null ) {

		this.name = name;
		this.object = object;
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

	private _speedAction: SpeedAction;

	get speedAction () {
		return this._speedAction;
	}

	set speedAction ( value ) {
		this._speedAction = value;
	}

	private _roadId: number;

	get roadId (): number {

		return this._roadId;

	}

	set roadId ( value: number ) {

		// let vehiclesOnRoad = PlayerService.traffic.get( this.roadId );
		//
		// vehiclesOnRoad = vehiclesOnRoad.filter( entity => {
		//     return entity.name != this.name;
		// } );
		//
		// // reset traffic on that road
		// PlayerService.traffic.set( this.roadId, vehiclesOnRoad );

		this._roadId = value;

		// add this vehicle on new road
		// PlayerService.traffic.get( this.roadId ).push( this );

		// console.log( PlayerService.traffic );
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

	addInitAction ( action: AbstractPrivateAction ) {

		this.initActions.push( action );

	}

	update () {

		if ( !this.automove && !this.enabled ) return;

		const previousPosition = this.position.clone();

		this.controller.update();

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
}

