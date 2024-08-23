/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/objects/game-object';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Maths } from 'app/utils/maths';
import { Box3, Group, MathUtils, Vector2, Vector3 } from 'three';
import { TvContactPoint, TvDynamicTypes, TvOrientation, TvRoadType, TvUnit } from './tv-common';
import { TvElevationProfile } from '../road-elevation/tv-elevation-profile.model';
import { TvJunction } from './junctions/tv-junction';
import { TvLaneSection } from './tv-lane-section';
import { TvLateralProfile } from './tv-lateral.profile';
import { TvPlaneView } from './tv-plane-view';
import { TvPosTheta } from './tv-pos-theta';
import { TvLaneProfile } from './tv-lane-profile';
import { TvRoadLink, TvRoadLinkType } from './tv-road-link';
import { TvRoadLinkNeighbor } from './tv-road-link-neighbor';
import { TvRoadObject } from './objects/tv-road-object';
import { TvRoadSignal } from '../road-signal/tv-road-signal.model';
import { TvRoadTypeClass } from './tv-road-type.class';
import { TvUtils } from './tv-utils';
import { RoadStyle } from "../../graphics/road-style/road-style.model";
import { TvLane } from './tv-lane';
import { TvObjectContainer } from "./objects/tv-object-container";
import { TrafficRule } from './traffic-rule';
import { DuplicateModelException } from 'app/exceptions/exceptions';
import { RoadGeometryService } from 'app/services/road/road-geometry.service';

export class TvRoad {

	public readonly uuid: string;

	public spline: AbstractSpline;

	public sStart: number;

	public type: TvRoadTypeClass[] = [];

	private elevationProfile: TvElevationProfile;

	private lateralProfile: TvLateralProfile;

	public drivingMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

	public sidewalkMaterialGuid: string = '87B8CB52-7E11-4F22-9CF6-285EC8FE9218';

	public borderMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

	public shoulderMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

	public trafficRule = TrafficRule.RHT;

	public boundingBox: Box3;

	public gameObject: GameObject;

	public signalGroup: Group = new Group();

	public objectGroup: Group = new Group();

	private laneProfile: TvLaneProfile;

	public objects: TvObjectContainer;

	public signals: Map<number, TvRoadSignal>;

	private planView: TvPlaneView;

	public neighbors: TvRoadLinkNeighbor[] = [];

	public name: string;

	// public length: number;

	public id: number;

	public junction: TvJunction;

	public successor?: TvRoadLink;

	public predecessor?: TvRoadLink;

	public cornerRoad: boolean = false;

	constructor ( name: string, length: number, id: number, junction?: TvJunction ) {

		this.uuid = MathUtils.generateUUID();
		this.name = name;
		// this.length = length;
		this.id = id;
		this.junction = junction;
		this.planView = new TvPlaneView();
		this.laneProfile = new TvLaneProfile( this );
		this.elevationProfile = new TvElevationProfile();
		this.lateralProfile = new TvLateralProfile();
		this.objects = new TvObjectContainer();
		this.signals = new Map<number, TvRoadSignal>();

		this.signalGroup.name = 'SignalGroup';
		this.objectGroup.name = 'ObjectGroup';
	}

	get junctionId (): number {
		return this.junction?.id ?? -1;
	}

	get isJunction (): boolean {
		return this.junctionId !== -1;
	}

	get geometries () {
		return this.planView.geometries;
	}

	get laneSections () {
		return this.laneProfile.getLaneSections();
	}

	get laneOffsets () {
		return this.laneProfile.getLaneOffsets();
	}

	get hasType (): boolean {
		return this.type.length > 0;
	}

	get length (): number {
		return this.getLength();
	}

	getLength (): number {
		return this.planView.getBlockLength();
	}

	toString () {

		if ( this.isJunction ) {
			return `ConnectingRoad:${ this.id } Junction:${ this.junctionId } Successor:${ this.successor?.element.id } Predecessor:${ this.predecessor?.element.id }`;
		}

		// return `Road:${ this.id } Successor:${ this.successor?.type }:${ this.successor?.element.id } Predecessor:${ this.predecessor?.type }:${ this.predecessor?.element.id }`;
		return `Road:${ this.id }`;

	}

	hasSuccessor () {

		return this.successor != null;

	}

	hasPredecessor () {

		return this.predecessor != null;

	}

	getEndPosTheta () {

		return this.getPosThetaAt( this.length - Maths.Epsilon );

	}

	getStartPosTheta () {

		// helps catch bugs
		if ( this.geometries.length == 0 ) {
			throw new Error( 'NoGeometriesFound' );
		}

		return this.getPosThetaAt( 0 );

	}

	setType ( type: TvRoadType, maxSpeed: number = 40, unit: TvUnit = TvUnit.MILES_PER_HOUR ) {

		this.type.push( new TvRoadTypeClass( 0, type, maxSpeed, unit ) );

	}

	setSuccessor ( elementType: TvRoadLinkType, element: TvRoad | TvJunction, contactPoint?: TvContactPoint ) {

		this.successor = new TvRoadLink( elementType, element, contactPoint );

	}

	setPredecessor ( elementType: TvRoadLinkType, element: TvRoad | TvJunction, contactPoint?: TvContactPoint ) {

		this.predecessor = new TvRoadLink( elementType, element, contactPoint );

	}

	setSuccessorRoad ( road: TvRoad, contactPoint: TvContactPoint ) {

		this.setSuccessor( TvRoadLinkType.ROAD, road, contactPoint );

	}

	setPredecessorRoad ( road: TvRoad, contactPoint: TvContactPoint ) {

		this.setPredecessor( TvRoadLinkType.ROAD, road, contactPoint );

	}

	getPlanView (): TvPlaneView {

		return this.planView;

	}

	setElevationProfile ( elevationProfile: TvElevationProfile ) {

		this.elevationProfile = elevationProfile;

	}

	addElevationProfile ( elevationProfile?: TvElevationProfile ) {

		if ( elevationProfile ) {

			this.elevationProfile = elevationProfile;

		} else if ( this.elevationProfile == null ) {

			this.elevationProfile = new TvElevationProfile();

		}
	}

	getLaneProfile (): TvLaneProfile {

		return this.laneProfile;

	}

	getTypes (): TvRoadTypeClass[] {

		return this.type;

	}

	addSignal ( signal: TvRoadSignal ): void {

		this.signals.set( signal.id, signal );

	}

	getSignalCount (): any {

		return this.signals.size;

	}

	getRoadSignals (): TvRoadSignal[] {

		return Array.from( this.signals.values() );

	}

	clearSignals () {

		this.signals.clear();

	}

	getRoadSignalById ( id: number ): TvRoadSignal {

		return this.signals.get( id );

	}

	getRoadObjects (): TvRoadObject[] {

		return this.objects.object;

	}

	getElevationProfile (): TvElevationProfile {

		return this.elevationProfile;

	}

	getLateralProfile (): TvLateralProfile {

		return this.lateralProfile;

	}


	/**
	 *
	 * @param s
	 * @param t
	 * @deprecated
	 */
	getPosThetaAt ( s: number, t = 0 ): TvPosTheta {

		return RoadGeometryService.instance.findRoadPosition( this, s, t );

	}

	addRoadSignal (
		s: number,
		t: number,
		id: number,
		name: string,
		dynamic: TvDynamicTypes,
		orientation: TvOrientation,
		zOffset: number,
		country: string,
		type: string,
		subtype: string,
		value: number,
		unit: TvUnit,
		height: number,
		width: number,
		text: string,
		hOffset: number,
		pitch: number,
		roll: number
	) {

		const signal = new TvRoadSignal(
			s, t, id, name,
			dynamic, orientation, zOffset,
			country, type, subtype,
			value, unit,
			height, width, text,
			hOffset, pitch, roll
		);

		signal.roadId = this.id;

		this.signals.set( signal.id, signal );

		return signal;
	}

	addRoadObject ( object: TvRoadObject ) {

		if ( this.hasRoadObject( object ) ) {
			throw new DuplicateModelException( `RoadObject ${ object.attr_id } already exists in ${ this.toString() }` );
		}

		object.road = this;

		this.objects.object.push( object );

	}

	hasRoadObject ( roadObject: TvRoadObject ) {

		return this.objects.object.includes( roadObject );

	}

	getRoadObjectCount () {

		return this.objects.object.length;

	}

	addRoadObjectInstance ( roadObject: TvRoadObject ) {

		if ( this.objects.object.includes( roadObject ) ) return;

		roadObject.road = this;

		this.objects.object.push( roadObject );

	}

	removeRoadObjectById ( id: number ) {

		for ( let i = 0; i < this.objects.object.length; i++ ) {

			const element = this.objects.object[ i ];

			if ( element.attr_id == id ) {

				this.objects.object.splice( i, 1 );
				break;

			}
		}
	}

	clearGeometries () {

		this.geometries.splice( 0, this.geometries.length );

		// this.length = 0;

		this.getLaneProfile().computeLaneSectionCoordinates();

	}

	getRoadTypeAt ( s: number ): TvRoadTypeClass {

		// add a default type if none exists
		if ( !this.hasType ) this.setType( TvRoadType.TOWN, 40 );

		return TvUtils.checkIntervalArray( this.type, s ) as TvRoadTypeClass;
	}

	getPosThetaByPosition ( point: Vector3 ): TvPosTheta {

		let minDistance = Number.MAX_SAFE_INTEGER;

		const coordinates = new TvPosTheta();

		for ( const geometry of this.geometries ) {

			const temp = new TvPosTheta();

			const nearestPoint = geometry.getNearestPointFrom( point.x, point.y, temp );

			const distance = new Vector2( point.x, point.y ).distanceTo( nearestPoint );

			if ( distance < minDistance ) {
				minDistance = distance;
				coordinates.copy( temp );
			}
		}

		return coordinates;
	}

	/**
	 * @deprecated use RoadGeometryService instead
	 */
	getReferenceLinePoints ( step = 1.0, t?: number ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		for ( let s = 0; s <= this.length; s += step ) {

			points.push( this.getPosThetaAt( s, t ) );

		}

		points.push( this.getPosThetaAt( this.length - Maths.Epsilon, t ) );

		return points;
	}

	computeLaneSectionCoordinates () {

		this.getLaneProfile().computeLaneSectionCoordinates();

	}

	set roadStyle ( roadStyle: RoadStyle ) {

		this.laneProfile.clear();

		this.getLaneProfile().addLaneOffset( roadStyle.laneOffset.clone() );

		this.getLaneProfile().addLaneSectionInstance( roadStyle.laneSection.cloneAtS( 0 ) );

		this.elevationProfile = roadStyle.elevationProfile.clone();

		this.objects.object = [];

		roadStyle.objects.map( obj => this.addRoadObjectInstance( obj.clone() ) );

	}

	get roadStyle (): RoadStyle {

		return RoadStyle.fromRoad( this );

	}

	clone ( s: number ): TvRoad {

		const road = new TvRoad( this.name, this.length, this.id, this.junction );

		road.spline = this.spline;
		road.type = this.type.map( type => type.clone() );
		road.sStart = this.sStart;
		road.drivingMaterialGuid = this.drivingMaterialGuid;
		road.sidewalkMaterialGuid = this.sidewalkMaterialGuid;
		road.borderMaterialGuid = this.borderMaterialGuid;
		road.shoulderMaterialGuid = this.shoulderMaterialGuid;
		road.trafficRule = this.trafficRule;
		road.planView = this.planView.clone();
		road.predecessor = this.predecessor?.clone();
		road.successor = this.successor?.clone();

		road.getLaneProfile().addLaneSectionInstance( this.getLaneProfile().getLaneSectionAt( s ).cloneAtS( 0, 0 ) );

		road.objects.object = this.objects.object.map( obj => obj.clone() );

		return road;

	}

	/**
	 * @deprecated use RoadGeometryService instead
	 */
	getLaneCenterPosition ( lane: TvLane, s: number, offset = 0 ) {

		return RoadGeometryService.instance.findLaneCenterPosition( this, lane.laneSection, lane, s, offset );
	}

	/**
	 * @deprecated use RoadGeometryService instead
	 */
	getLaneStartPosition ( lane: TvLane, s: number, offset = 0 ) {

		return RoadGeometryService.instance.findLaneStartPosition( this, lane.laneSection, lane, s, offset );

	}

	/**
	 * @deprecated use RoadGeometryService instead
	 */
	getLaneEndPosition ( lane: TvLane, s: number, offset = 0 ) {

		return RoadGeometryService.instance.findLaneEndPosition( this, lane.laneSection, lane, s, offset );

	}

	computeBoundingBox (): void {

		let boundingBox: Box3;

		this.laneProfile.getLaneSections().map( laneSection => {

			laneSection.lanesMap.forEach( lane => {

				if ( lane.id == 0 ) return;

				if ( !lane.gameObject ) return;

				if ( !boundingBox ) {

					boundingBox = lane.gameObject.geometry.boundingBox;

				} else {

					boundingBox.union( lane.gameObject.geometry.boundingBox );

				}

			} );

		} );

		this.boundingBox = boundingBox;

	}

	/**
	* @deprecated use RoadGeometryService instead
	*/
	getPosThetaByContact ( contact: TvContactPoint ): TvPosTheta {

		return RoadGeometryService.instance.findContactPosition( this, contact );

	}

	markAsCornerRoad () {

		this.cornerRoad = true;

	}

	getLaneSectionLength ( laneSection: TvLaneSection ) {

		return laneSection.getLength();

	}

	static ruleToString ( rule: TrafficRule ): string {

		return rule === TrafficRule.LHT ? 'LHT' : 'RHT';

	}

	static stringToRule ( value: string ): TrafficRule {

		return value === 'LHT' ? TrafficRule.LHT : TrafficRule.RHT;

	}

}
