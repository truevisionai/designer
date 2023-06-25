/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BoxGeometry, Euler, MathUtils, MeshBasicMaterial, Vector3 } from 'three';
import { GameObject } from '../../../core/game-object';
import { TvConsole } from '../../../core/utils/console';
import { Maths } from '../../../utils/maths';
import { TvLaneType } from '../../tv-map/models/tv-common';
import { TvMapInstance } from '../../tv-map/services/tv-map-source-file';
import { AbstractController } from './abstract-controller';
import { PrivateAction } from './private-action';
import { TvAxles, TvBoundingBox, TvDimension, TvPerformance } from './tv-bounding-box';
import { ScenarioObjectType, VehicleCategory } from './tv-enums';
import { Orientation } from './tv-orientation';
import { ParameterDeclaration } from './tv-parameter-declaration';
import { TvProperty } from './tv-properties';

class OpenDriveProperties {
	public speed: number = 0;
	public roadId: number = 0;
	public laneSectionId: number = 0;
	public laneId: number = 0;
	public s: number = 0;
	public laneOffset: number = 0;
	public direction: number = 0;
	public autonomous: boolean = false;
	public distanceTraveled: number;

	isEndOfRoad () {
		const road = TvMapInstance.map.getRoadById( this.roadId );

		// either at the end of the road
		// or at the beginning
		if (
			this.s >= road.length - Maths.Epsilon ||
			this.s <= Maths.Epsilon
		) {

			return true;

		} else {

			return false;

		}
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

	reset () {

		this.roadId = 0;
		this.laneSectionId = 0;
		this.laneId = 0;
		this.autonomous = false;
		this.distanceTraveled = 0;
		this.direction = 0;
		this.s = 0;
		this.laneOffset = 0;
		this.speed = 0;

	}
}

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

	update () {

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

		if ( this.originalPosition ) {
			this.setPosition( this.originalPosition );
			this.originalPosition = null;
		}

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
}


export class VehicleEntity extends ScenarioEntity {

	public scenarioObjectType: ScenarioObjectType = ScenarioObjectType.vehicle;

	constructor (
		public name: string,
		public vehicleCategory: VehicleCategory = VehicleCategory.car,
		public boundingBox: TvBoundingBox = new TvBoundingBox( new Vector3( 0, 0, 0 ), new TvDimension( 2.0, 4.2, 1.6 ) ),
		public performance: TvPerformance = new TvPerformance( 100, 4, 9 ),
		public axles: TvAxles = null,
		public properties: TvProperty[] = []
	) {
		super( name, boundingBox );
	}

	static getNewName ( name = 'Vehicle' ) {

		return `${ name }${ MathUtils.generateUUID().substring( 0, 4 ) }`;

	}
}
