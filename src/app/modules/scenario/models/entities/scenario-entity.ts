/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IHasUpdate } from 'app/modules/three-js/commands/set-value-command';
import { IHasPosition } from 'app/modules/three-js/objects/i-has-position';
import { ArrowHelper, BoxGeometry, Euler, MeshBasicMaterial, Vector3 } from 'three';
import { GameObject } from '../../../../core/game-object';
import { TvConsole } from '../../../../core/utils/console';
import { AbstractController } from '../abstract-controller';
import { TeleportAction } from '../actions/tv-teleport-action';
import { PrivateAction } from '../private-action';
import { TvBoundingBox } from '../tv-bounding-box';
import { ScenarioObjectType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { ParameterDeclaration } from '../tv-parameter-declaration';
import { TvProperty } from '../tv-properties';
import { OpenDriveProperties } from './open-drive-properties';

export abstract class ScenarioEntity extends GameObject implements IHasUpdate, IHasPosition {

	public abstract scenarioObjectType: ScenarioObjectType;
	public parameterDeclarations: ParameterDeclaration[] = [];
	public controller: AbstractController;
	public properties: TvProperty[] = [];
	public initActions: PrivateAction[] = [];

	public openDriveProperties = new OpenDriveProperties();
	public model3d: string = 'default';
	private enabled: Boolean = true;
	private originalPosition: Vector3;

	protected constructor ( public name: string, public boundingBox: TvBoundingBox ) {
		super( name, new BoxGeometry(
			boundingBox.dimension.width,
			boundingBox.dimension.length,	// reverse because y is north
			boundingBox.dimension.height // reverse because z is up
		), new MeshBasicMaterial( {
			color: 0xffffff,
			transparent: true,
			opacity: 0.6,
		} ) );
		this.userData.entity = this;
		// this.addArrow()
	}

	get roadId () {
		return this.openDriveProperties.roadId;
	}

	set roadId ( value: number ) {
		this.openDriveProperties.roadId = value;
	}

	get laneId () {
		return this.openDriveProperties.laneId;
	}

	set laneId ( value: number ) {
		this.openDriveProperties.laneId = value;
	}

	get laneSectionId () {
		return this.openDriveProperties.laneSectionId;
	}

	set laneSectionId ( value: number ) {
		this.openDriveProperties.laneSectionId = value;
	}

	get laneOffset () {
		return this.openDriveProperties.laneOffset;
	}

	set laneOffset ( value: number ) {
		this.openDriveProperties.laneOffset = value;
	}

	get sCoordinate () {
		return this.openDriveProperties.s;
	}

	set sCoordinate ( value: number ) {
		this.openDriveProperties.s = value;
		this.openDriveProperties.distanceTraveled += value;
	}

	get direction () {
		return this.openDriveProperties.direction;
	}

	set direction ( value: number ) {
		this.openDriveProperties.direction = value;
	}

	get speed () {
		return this.openDriveProperties.speed;
	}

	set speed ( value: number ) {
		this.openDriveProperties.speed = value;
	}

	copyPosition ( position: Vector3 ): void {
		this.setPosition( position );
	}

	getPosition (): Vector3 {
		return this.position;
	}

	update (): void {

		const teleportAction = this.initActions.find( action => action instanceof TeleportAction ) as TeleportAction;

		teleportAction?.position?.updateFromWorldPosition( this.position.clone(), null );

	}

	addArrow () {

		// assuming yourObject is the object you want to show direction for

		// get the world direction (forward direction) of the object
		var forward = this.getWorldDirection( new Vector3() ).normalize();

		// get the 'up' direction of the object
		var up = this.up.clone();

		// calculate 'right' direction which is the cross product of 'forward' and 'up' vectors
		var right = new Vector3();
		right.crossVectors( forward, up );

		// create origin vectors at your object's current position
		var origin = this.position;

		// create a length for the arrow (this is up to you)
		var length = 1;

		// create hex colors for the arrows (these are up to you)
		var hex_forward = 0xff0000;  // red for forward direction
		var hex_up = 0x00ff00;      // green for up direction
		var hex_right = 0x0000ff;   // blue for right direction

		// create the arrowHelpers
		var arrowHelperForward = new ArrowHelper( forward, origin, length, hex_forward );
		var arrowHelperUp = new ArrowHelper( up, origin, length, hex_up );
		var arrowHelperRight = new ArrowHelper( right, origin, length, hex_right );

		// add the arrowHelpers to your scene
		this.add( arrowHelperForward );
		this.add( arrowHelperUp );
		this.add( arrowHelperRight );


	}

	public addParameterDeclaration ( parameterDeclaration: ParameterDeclaration ): void {
		this.parameterDeclarations.push( parameterDeclaration );
	}

	public setController ( controller: AbstractController ): void {
		this.controller = controller;
	}

	public addInitAction ( action: PrivateAction ): void {

		this.initActions.push( action );

		action.updated.subscribe( action => action.execute( this ) );

	}

	public removeInitAction ( action: PrivateAction ): void {
		this.initActions = this.initActions.filter( a => a !== action );
	}

	onUpdate () {

		if ( !this.openDriveProperties.autonomous && !this.enabled ) return;

		if ( !this.originalPosition ) this.originalPosition = this.position.clone();

		const previousPosition = this.position.clone();

		this.controller.update();

		const newPosition = this.position.clone();

		// this.openDriveProperties.distanceTraveled += previousPosition.distanceTo( newPosition );
	}

	setLaneOffset ( laneOffset: number ): void {
		this.openDriveProperties.laneOffset = laneOffset;
	}

	setLaneId ( laneId: number ): void {
		this.openDriveProperties.laneId = laneId;
	}

	getCurrentRoadId (): number {
		return this.openDriveProperties.roadId;
	}

	getS (): number {
		return this.openDriveProperties.s;
	}

	setPosition ( newPosition: Vector3 ): void {
		this.position.copy( newPosition );
	}

	setAutonomous ( value: boolean ) {
		this.openDriveProperties.autonomous = value;
	}

	setSpeed ( newSpeed: number ) {
		this.openDriveProperties.speed = newSpeed;
	}

	reset (): void {

		this.openDriveProperties.reset();

		this.userData.position = this.position.copy( this.userData.position );
		this.userData.rotation = this.rotation.copy( this.userData.rotation );

	}

	setEuler ( value: Euler ) {
		this.rotation.copy( value );
	}

	getEuler (): Euler {
		return this.rotation;
	}

	getOrientation (): Orientation {
		return new Orientation(
			this.rotation.x,
			this.rotation.y,
			this.rotation.z,
		);
	}

	getCurrentSpeed (): number {
		return this.openDriveProperties.speed;
	}

	enable () {
		this.enabled = this.visible = true;
	}

	disable () {
		this.enabled = this.visible = false;
	}

	getCurrentLaneId (): number {
		return this.openDriveProperties.laneId;
	}

	getCurrentLaneOffset (): number {
		return this.openDriveProperties.laneOffset;
	}

	getCurrentAcceleration (): number {
		TvConsole.warn( 'Acceleration not computed' );
		return 0;
	}

	isAtEndOfRoad (): boolean {
		return this.openDriveProperties.isEndOfRoad();
	}

	isOffRoad (): boolean {
		return this.openDriveProperties.isOffRoad();
	}

	getDistanceTraveled (): number {
		return this.openDriveProperties.distanceTraveled;
	}

	getCurrentPosition (): Vector3 {
		return this.position;
	}

	setRoadId ( id: number ) {
		this.openDriveProperties.roadId = id;
	}

	setLaneSectionId ( id: number ) {
		this.openDriveProperties.laneSectionId = id;
	}

	getLaneSectionId () {
		return this.openDriveProperties.laneSectionId;
	}

	setDirection ( number: number ) {
		this.openDriveProperties.direction = number;
	}

	setSValue ( s: number ) {
		this.openDriveProperties.s = s;
	}

	getTravelingDirection () {
		return this.openDriveProperties.direction;
	}

	setTravelingDirection ( number: number ) {
		this.openDriveProperties.direction = number;
	}

	onStart () {

		this.userData.position = this.position.clone();
		this.userData.rotation = this.rotation.clone();
		this.userData.openDriveProperties = this.openDriveProperties.clone();

		this.initActions.forEach( action => action.execute( this ) );

		this.controller?.start();
	}
}


