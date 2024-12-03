/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IHasUpdate } from 'app/commands/set-value-command';
import { Euler, MathUtils, Object3D, Vector3 } from 'three';
import { TvConsole } from '../../../core/utils/console';
import { AbstractController } from '../abstract-controller';
import { TeleportAction } from '../actions/tv-teleport-action';
import { PrivateAction } from '../private-action';
import { TvBoundingBox } from '../tv-bounding-box';
import { ScenarioObjectType } from '../tv-enums';
import { Orientation } from '../tv-orientation';
import { ParameterDeclaration } from '../tv-parameter-declaration';
import { TvProperty } from '../tv-properties';
import { OpenDriveProperties } from './open-drive-properties';

export abstract class ScenarioEntity implements IHasUpdate {

	public uuid: string;

	public abstract scenarioObjectType: ScenarioObjectType;

	public parameterDeclarations: ParameterDeclaration[] = [];

	public controller: AbstractController;

	public properties: TvProperty[] = [];

	public initActions: PrivateAction[] = [];

	public openDriveProperties = new OpenDriveProperties();

	public model3d: string = 'default';

	public position: Vector3;

	public rotation: Euler;

	public visible: boolean;

	public mesh: Object3D;

	private enabled: Boolean = true;

	private originalPosition: Vector3;

	protected constructor ( public name: string, public boundingBox: TvBoundingBox ) {
		this.uuid = MathUtils.generateUUID();
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

	onUpdate (): void {

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

	setAutonomous ( value: boolean ): void {
		this.openDriveProperties.autonomous = value;
	}

	setSpeed ( newSpeed: number ): void {
		this.openDriveProperties.speed = newSpeed;
	}

	reset (): void {

		this.openDriveProperties.reset();

		//this.userData.position = this.position.copy( this.userData.position );
		//this.userData.rotation = this.rotation.copy( this.userData.rotation );

	}

	setEuler ( value: Euler ): void {
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

	enable (): void {
		this.enabled = this.visible = true;
	}

	disable (): void {
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

	setRoadId ( id: number ): void {
		this.openDriveProperties.roadId = id;
	}

	setLaneSectionId ( id: number ): void {
		this.openDriveProperties.laneSectionId = id;
	}

	getLaneSectionId () {
		return this.openDriveProperties.laneSectionId;
	}

	setDirection ( number: number ): void {
		this.openDriveProperties.direction = number;
	}

	setSValue ( s: number ): void {
		this.openDriveProperties.s = s;
	}

	getTravelingDirection () {
		return this.openDriveProperties.direction;
	}

	setTravelingDirection ( number: number ): void {
		this.openDriveProperties.direction = number;
	}

	onStart (): void {

		//this.userData.position = this.position.clone();
		//this.userData.rotation = this.rotation.clone();
		//this.userData.openDriveProperties = this.openDriveProperties.clone();

		this.initActions.forEach( action => action.execute( this ) );

		this.controller?.start();
	}

	clone () {
		return new ( this.constructor as any )( this.name, this.boundingBox );
	}
}


