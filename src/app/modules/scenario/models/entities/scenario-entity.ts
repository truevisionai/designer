/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BoxGeometry, Euler, MeshBasicMaterial, Vector3 } from 'three';
import { GameObject } from '../../../../core/game-object';
import { TvConsole } from '../../../../core/utils/console';
import { AbstractController } from '../abstract-controller';
import { OpenDriveProperties } from './open-drive-properties';
import { PrivateAction } from '../private-action';
import { TvBoundingBox } from '../tv-bounding-box';
import { Orientation } from '../tv-orientation';
import { ParameterDeclaration } from '../tv-parameter-declaration';
import { TvProperty } from '../tv-properties';

export abstract class ScenarioEntity extends GameObject {

	public parameterDeclarations: ParameterDeclaration[] = [];
	public controller: AbstractController;
	public properties: TvProperty[] = [];
	public initActions: PrivateAction[] = [];

	protected openDriveProperties = new OpenDriveProperties();

	private enabled: Boolean = true;
	private originalPosition: Vector3;

	protected constructor ( public name: string, public boundingBox: TvBoundingBox ) {
		super( name, new BoxGeometry(
			boundingBox.dimension.width,
			boundingBox.dimension.height,
			boundingBox.dimension.depth
		), new MeshBasicMaterial( {
			color: Math.random() * 0xffffff
		} ) );
		this.userData.entity = this;
	}

	public addParameterDeclaration ( parameterDeclaration: ParameterDeclaration ): void {
		this.parameterDeclarations.push( parameterDeclaration );
	}

	public setController ( controller: AbstractController ): void {
		this.controller = controller;
	}

	public addInitAction ( action: PrivateAction ): void {
		this.initActions.push( action );
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

		this.openDriveProperties.distanceTraveled += previousPosition.distanceTo( newPosition );
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

	set roadId ( value: number ) {
		this.openDriveProperties.roadId = value;
	}

	get roadId () {
		return this.openDriveProperties.roadId;
	}

	set laneId ( value: number ) {
		this.openDriveProperties.laneId = value;
	}

	get laneId () {
		return this.openDriveProperties.laneId;
	}

	set laneSectionId ( value: number ) {
		this.openDriveProperties.laneSectionId = value;
	}

	get laneSectionId () {
		return this.openDriveProperties.laneSectionId;
	}

	set laneOffset ( value: number ) {
		this.openDriveProperties.laneOffset = value;
	}

	get laneOffset () {
		return this.openDriveProperties.laneOffset;
	}

	set sCoordinate ( value: number ) {
		this.openDriveProperties.s = value;
	}

	get sCoordinate () {
		return this.openDriveProperties.s;
	}

	set direction ( value: number ) {
		this.openDriveProperties.direction = value;
	}

	get direction () {
		return this.openDriveProperties.direction;
	}

	set speed ( value: number ) {
		this.openDriveProperties.speed = value;
	}

	get speed () {
		return this.openDriveProperties.speed;
	}

	onStart () {

		this.userData.position = this.position.clone();
		this.userData.rotation = this.rotation.clone();
		this.userData.openDriveProperties = this.openDriveProperties.clone();

		this.initActions.forEach( action => action.execute( this ) );

	}
}


