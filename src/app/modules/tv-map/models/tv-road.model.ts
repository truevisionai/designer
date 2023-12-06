/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvConsole } from 'app/core/utils/console';
import { SnackBar } from 'app/services/snack-bar.service';
import { Maths } from 'app/utils/maths';
import { MathUtils, Vector2, Vector3 } from 'three';
import { TvAbstractRoadGeometry } from './geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from './geometries/tv-arc-geometry';
import { TvLineGeometry } from './geometries/tv-line-geometry';
import {
	ObjectTypes,
	TvContactPoint,
	TvDynamicTypes,
	TvLaneSide,
	TvOrientation,
	TvRoadType,
	TvUnit
} from './tv-common';
import { TvElevation } from './tv-elevation';
import { TvElevationProfile } from './tv-elevation-profile';
import { TvJunction } from './junctions/tv-junction';
import { TvLaneSection } from './tv-lane-section';
import { TvLateralProfile } from './tv-lateral.profile';
import { TvPlaneView } from './tv-plane-view';
import { TvPosTheta } from './tv-pos-theta';
import { TvRoadLaneOffset } from './tv-road-lane-offset';
import { TvRoadLanes } from './tv-road-lanes';
import { TvRoadLinkChild, TvRoadLinkChildType } from './tv-road-link-child';
import { TvRoadLinkNeighbor } from './tv-road-link-neighbor';
import { TvRoadObject } from './objects/tv-road-object';
import { TvRoadSignal } from './tv-road-signal.model';
import { TvRoadTypeClass } from './tv-road-type.class';
import { TvUtils } from './tv-utils';
import { MapEvents, RoadUpdatedEvent } from 'app/events/map-events';
import { RoadStyle } from "../../../core/asset/road.style";
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { AbstractControlPoint } from "../../three-js/objects/abstract-control-point";
import { TvLane } from './tv-lane';
import { TvObjectContainer } from "./objects/tv-object-container";
import { TrafficRule } from './traffic-rule';

export class TvRoad {

	public readonly uuid: string;

	private _spline: AbstractSpline;
	private _sStart: number;

	public type: TvRoadTypeClass[] = [];
	public elevationProfile: TvElevationProfile = new TvElevationProfile;
	public lateralProfile: TvLateralProfile;
	public lanes = new TvRoadLanes( this );

	public drivingMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';
	public sidewalkMaterialGuid: string = '87B8CB52-7E11-4F22-9CF6-285EC8FE9218';
	public borderMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';
	public shoulderMaterialGuid: string = '09B39764-2409-4A58-B9AB-D9C18AD5485C';

	public trafficRule = TrafficRule.RHT;
	public successor: TvRoadLinkChild;
	public predecessor: TvRoadLinkChild;


	private lastAddedLaneSectionIndex: number;
	private lastAddedRoadObjectIndex: number;

	private _objects: TvObjectContainer = new TvObjectContainer();
	private _signals: Map<number, TvRoadSignal> = new Map<number, TvRoadSignal>();
	private _planView = new TvPlaneView;

	private _neighbors: TvRoadLinkNeighbor[] = [];
	private _name: string;
	private _length: number;
	private _id: number;
	private _gameObject: GameObject;
	private junction: TvJunction;

	constructor ( name: string, length: number, id: number, junction?: TvJunction ) {

		this.uuid = MathUtils.generateUUID();
		this._name = name;
		this._length = length;
		this._id = id;
		this.spline = new AutoSplineV2();
	}

	get junctionId (): number {
		return this.junction?.id ?? -1;
	}

	setJunction ( junction: TvJunction ) {
		this.junction = junction;
	}

	get sStart (): number {
		return this._sStart;
	}

	set sStart ( value: number ) {
		this._sStart = value;
	}

	get spline (): AbstractSpline {
		return this._spline;
	}

	set spline ( value: AbstractSpline ) {
		this._spline = value;
	}

	get objects (): TvObjectContainer {
		return this._objects;
	}

	set objects ( value: TvObjectContainer ) {
		this._objects = value;
	}

	get signals (): Map<number, TvRoadSignal> {
		return this._signals;
	}

	set signals ( value: Map<number, TvRoadSignal> ) {
		this._signals = value;
	}

	get planView (): TvPlaneView {
		return this._planView;
	}

	set planView ( value: TvPlaneView ) {
		this._planView = value;
	}

	get neighbors (): TvRoadLinkNeighbor[] {
		return this._neighbors;
	}

	set neighbors ( value: TvRoadLinkNeighbor[] ) {
		this._neighbors = value;
	}

	get name (): string {
		return this._name;
	}

	set name ( value: string ) {
		this._name = value;
	}

	get length (): number {
		return this._length;
	}

	set length ( value: number ) {
		this._length = value;
	}

	get id (): number {
		return this._id;
	}

	set id ( value: number ) {
		this._id = value;
	}

	get junctionInstance (): TvJunction {
		throw new Error( 'causing circular dependenc' );
	}

	get gameObject () {
		return this._gameObject;
	}

	set gameObject ( value ) {
		this._gameObject = value;
	}

	get isJunction (): boolean {
		return this.junctionId !== -1;
	}

	get geometries () {
		return this._planView.geometries;
	}

	get laneSections () {
		return this.lanes.laneSections;
	}

	get hasType (): boolean {
		return this.type.length > 0;
	}

	update () {

		this.updateGeometryFromSpline();

	}

	hasSuccessor () {

		return this.successor != null;

	}

	hasPredecessor () {

		return this.predecessor != null;

	}

	setPredecessor ( elementType: TvRoadLinkChildType, elementId: number, contactPoint?: TvContactPoint ) {

		if ( this.predecessor == null ) {

			this.predecessor = new TvRoadLinkChild( elementType, elementId, contactPoint );

		} else {

			this.predecessor.elementType = elementType;
			this.predecessor.elementId = elementId;
			this.predecessor.contactPoint = contactPoint;

		}
	}

	getPositionAt ( s: number, t: number = 0 ): TvPosTheta {

		return this.getRoadCoordAt( s, t );

	}

	getEndCoord () {

		return this.getPositionAt( this.length - Maths.Epsilon );

	}

	getStartCoord () {

		// helps catch bugs
		if ( this.geometries.length == 0 ) {
			throw new Error( 'NoGeometriesFound' );
		}

		return this.getPositionAt( 0 );

	}

	setType ( type: TvRoadType, maxSpeed: number = 40, unit: TvUnit = TvUnit.MILES_PER_HOUR ) {

		this.type.push( new TvRoadTypeClass( 0, type, maxSpeed, unit ) );

	}

	setSuccessor ( elementType: TvRoadLinkChildType, elementId: number, contactPoint?: TvContactPoint ) {

		if ( this.successor == null ) {

			this.successor = new TvRoadLinkChild( elementType, elementId, contactPoint );

		} else {

			this.successor.elementType = elementType;
			this.successor.elementId = elementId;
			this.successor.contactPoint = contactPoint;

		}
	}

	setSuccessorRoad ( road: TvRoad, contactPoint: TvContactPoint ) {

		if ( this.successor == null ) {
			this.successor = new TvRoadLinkChild( TvRoadLinkChildType.road, road.id, contactPoint );
		}

		this.successor.elementType = TvRoadLinkChildType.road;
		this.successor.elementId = road.id;
		this.successor.contactPoint = contactPoint;

	}

	setPredecessorRoad ( road: TvRoad, contactPoint: TvContactPoint ) {

		if ( this.predecessor == null ) {
			this.predecessor = new TvRoadLinkChild( TvRoadLinkChildType.road, road.id, contactPoint );
		}

		this.predecessor.elementType = TvRoadLinkChildType.road;
		this.predecessor.elementId = road.id;
		this.predecessor.contactPoint = contactPoint;

	}

	getPlanView (): TvPlaneView {

		return this._planView;

	}

	addPlanView () {

		if ( this._planView == null ) {

			this._planView = new TvPlaneView();

		}
	}

	addElevation ( s: number, a: number, b: number, c: number, d: number ) {

		const index = this.checkElevationInterval( s ) + 1;

		const node = new TvElevation( s, a, b, c, d );

		if ( index > this.getElevationCount() ) {

			this.addElevationInstance( node );

		} else {

			this.elevationProfile.elevation[ index ] = node;

		}

		return node;
	}

	addElevationInstance ( elevation: TvElevation ) {

		this.elevationProfile.elevation.push( elevation );

		this.elevationProfile.elevation.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

		TvUtils.computeCoefficients( this.elevationProfile.elevation, this.length );

	}

	removeElevationInstance ( elevation: TvElevation ) {

		const index = this.elevationProfile.elevation.indexOf( elevation );

		if ( index > -1 ) {

			this.elevationProfile.elevation.splice( index, 1 );

		}

		this.elevationProfile.elevation.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

		TvUtils.computeCoefficients( this.elevationProfile.elevation, this.length );
	}

	checkElevationInterval ( s: number ): number {

		let res = -1;

		// Go through all the road type records
		for ( let i = 0; i < this.elevationProfile.elevation.length; i++ ) {

			if ( this.elevationProfile.elevation[ i ].checkInterval( s ) ) {

				res = i;

			} else {

				break;

			}
		}

		// return the result: 0 to MaxInt as the index to the
		// record containing s_check or -1 if nothing found
		return res;
	}

	getElevationCount () {

		return this.elevationProfile.elevation.length;

	}

	getElevationValue ( s: number ) {

		const elevation = this.getElevationAt( s );

		if ( elevation == null ) return 0;

		// console.log( value );

		return elevation.getValue( s );
	}

	addElevationProfile () {

		if ( this.elevationProfile == null ) {

			this.elevationProfile = new TvElevationProfile();

		}
	}

	/**
	 *
	 * @param s
	 * @param singleSide
	 * @deprecated use addGetLaneSection
	 */
	addLaneSection ( s: number, singleSide: boolean ) {

		this.addGetLaneSection( s, singleSide );

		this.lastAddedLaneSectionIndex = this.lanes.laneSections.length - 1;

		return this.lastAddedLaneSectionIndex;
	}

	addLaneSectionInstance ( laneSection: TvLaneSection ) {

		laneSection.road = this;

		laneSection.lanes.forEach( lane => {

			lane.roadId = this.id;

			lane.laneSection = laneSection;

		} );

		this.laneSections.push( laneSection );

		this.sortLaneSections();

		this.computeLaneSectionLength();
	}

	clearLaneSections () {

		this.laneSections.splice( 0, this.laneSections.length );

	}

	addGetLaneSection ( s: number, singleSide: boolean = false ): TvLaneSection {

		const laneSections = this.getLaneSections();

		const laneSectionId = laneSections.length + 1;

		const laneSection = new TvLaneSection( laneSectionId, s, singleSide, this );

		this.addLaneSectionInstance( laneSection );

		return laneSection;
	}

	duplicateLaneSectionAt ( s: number ): TvLaneSection {

		const laneSection = this.getLaneSectionAt( s );

		const newId = this.lanes.laneSections.length + 1;

		const newLaneSection = laneSection.cloneAtS( newId, s );

		this.addLaneSectionInstance( newLaneSection );

		return newLaneSection;
	}

	sortLaneSections () {

		// sort the lansections by s value

		this.lanes.laneSections.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

		// const inDescOrder = ( a: [ number, TvLaneSection ], b: [ number, TvLaneSection ] ) => a[ 1 ].id > b[ 1 ].id ? -1 : 1;

		// const laneSections = this.laneSections.map( laneSection => [ laneSection.id, laneSection ] );

		// laneSections.sort( inDescOrder );

		// this.lanes.laneSections = laneSections.map( laneSection => laneSection[ 1 ] );

	}

	getLaneSectionCount () {

		return this.getLaneSections().length;

	}

	getFirstLaneSection () {

		return this.laneSections[ 0 ];

	}

	getLastLaneSection () {

		return this.laneSections[ this.laneSections.length - 1 ];

	}

	getLaneSection ( i: number ) {

		return this.lanes.laneSections[ i ];

	}

	getLaneSectionLength ( section: TvLaneSection ) {

		// find next section higher than requested section
		const next = this.laneSections.find( s => s.s > section.s );

		return next ?
			next.s - section.s :
			this.length - section.s;
	}

	getLastAddedLaneSection () {

		return this.lanes.laneSections[ this.lastAddedLaneSectionIndex ];

	}

	getTypes (): TvRoadTypeClass[] {

		return this.type;

	}

	addSignal ( signal: TvRoadSignal ): void {

		this._signals.set( signal.id, signal );

	}

	removeSignal ( signal: TvRoadSignal ): any {

		this.removeSignalById( signal.id );

	}

	removeSignalById ( signalId: number ): boolean {

		return this.signals.delete( signalId );

	}

	getRoadSignalCount (): number {

		return this._signals.size;

	}

	getRoadSignals (): TvRoadSignal[] {

		return [ ...this._signals.values() ];

	}

	getRoadSignal ( id: number ) {

		return this._signals.get( id );

	}

	getRoadSignalById ( id: number ): TvRoadSignal {

		return this._signals.get( id );

	}

	getRoadObjects (): TvRoadObject[] {

		return this._objects.object;

	}

	getRoadObject ( i: number ): TvRoadObject {

		return this._objects.object[ i ];

	}

	getRoadObjectCount (): number {

		return this._objects.object.length;

	}

	getElevationProfile (): TvElevationProfile {

		return this.elevationProfile;

	}

	getLaneSections (): TvLaneSection[] {

		return this.lanes.laneSections;

	}

	getRoadCoordAt ( s: number, t = 0 ): TvPosTheta {

		// // helps catch bugs
		// if ( this.geometries.length == 0 ) {

		// 	if ( this.spline?.controlPoints.length > 1 ) {
		// 		this.updateGeometryFromSpline();
		// 	}

		// 	if ( this.geometries.length == 0 ) {
		// 		throw new Error( 'NoGeometriesFound' );
		// 	}
		// }

		if ( s == null ) TvConsole.error( 's is undefined' );

		if ( s > this.length || s < 0 ) TvConsole.warn( 's is greater than road length or less than 0' );

		const geometry = this.getGeometryAt( s );

		if ( !geometry ) {
			console.log( this.geometries );
			throw new Error( `GeometryNotFoundAt S:${ s } RoadId:${ this.id }` );
		}

		const odPosTheta = geometry.getRoadCoord( s );

		// if ( !geometryType ) {
		//
		// 	SentryService.captureException( new Error( `GeometryErrorWithFile S:${ s } RoadId:${ this.id }` ) );
		//
		// 	SnackBar.error( `GeometryTypeNotFoundAt ${ s } RoadId:${ this.id }` );
		//
		// 	return;
		// }

		const laneOffset = this.getLaneOffsetValue( s );

		odPosTheta.addLateralOffset( laneOffset );

		// this is additonal offset passed by user
		// and not from lane-offset property of road
		odPosTheta.addLateralOffset( t );

		odPosTheta.z = this.getElevationValue( s );

		return odPosTheta;
	}

	getGeometryBlockCount (): number {

		return this._planView.geometries.length;

	}

	getGeometryBlock ( i: number ): TvAbstractRoadGeometry {

		return this._planView.geometries[ i ];

	}

	getRoadLength () {

		return this._length;

	}

	// TODO: Fix this
	getSuperElevationValue ( s: number ): number {

		return null;

	}

	// fillLaneSectionSample ( s: number, laneSectionSample: OdLaneSectionSample ) {
	//
	//     const index = this.checkLaneSectionInterval( s );
	//
	//     if ( index >= 0 ) {
	//
	//         this.lanes.laneSection[ index ].fillLaneSectionSample( s, laneSectionSample );
	//
	//     }
	// }

	// TODO: Fix this
	getCrossfallValue ( s: number, angleLeft: number, angleRight: number ): number {

		return null;

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

		this._signals.set( id, signal );

		return signal;
	}

	getLastAddedRoadObject (): TvRoadObject {
		return this._objects.object[ this.lastAddedRoadObjectIndex ];
	}

	addRoadObject (
		type: ObjectTypes,
		name: string,
		id: number,
		s: number,
		t: number,
		zOffset: number = 0,
		validLength: number = 0,
		orientation: TvOrientation = TvOrientation.NONE,
		length: number = 0,
		width: number = 0,
		radius: number = 0,
		height: number = 0,
		hdg: number = 0,
		pitch: number = 0,
		roll: number = 0
	): TvRoadObject {

		const obj = new TvRoadObject(
			type,
			name,
			id,
			s,
			t,
			zOffset,
			validLength,
			orientation,
			length,
			width,
			radius,
			height,
			hdg,
			pitch,
			roll
		);

		obj.road = this;

		this.addRoadObjectInstance( obj );

		return obj;
	}

	addRoadObjectInstance ( roadObject: TvRoadObject ) {

		if ( this.objects.object.includes( roadObject ) ) return;

		roadObject.road = this;

		this._objects.object.push( roadObject );

		this.lastAddedRoadObjectIndex = this._objects.object.length - 1;
	}

	removeRoadObjectById ( id: number ) {

		for ( let i = 0; i < this._objects.object.length; i++ ) {

			const element = this._objects.object[ i ];

			if ( element.attr_id == id ) {

				this._objects.object.splice( i, 1 );
				break;

			}
		}
	}

	getLaneSectionAt ( s: number ): TvLaneSection {

		return this.lanes.getLaneSectionAt( s );

	}

	// todo move this lanes
	updateLaneOffsetValues (): void {

		this.lanes.updateLaneOffsetValues( this.length );

	}

	addLaneOffset ( s: number, a: number, b: number, c: number, d: number ): TvRoadLaneOffset {

		return this.lanes.addLaneOffsetRecord( s, a, b, c, d );

	}

	addLaneOffsetInstance ( laneOffset: TvRoadLaneOffset ): void {

		this.lanes.addLaneOffsetInstance( laneOffset );

		this.lanes.updateLaneOffsetValues( this.length );

	}

	removeLaneOffset ( laneOffset: TvRoadLaneOffset ): void {

		const index = this.lanes.getLaneOffsets().findIndex( i => i.uuid === laneOffset.uuid );

		if ( index !== -1 ) {

			this.lanes.getLaneOffsets().splice( index, 1 );

		}

		this.lanes.updateLaneOffsetValues( this.length );
	}

	getLaneOffsetAt ( s: number ) {

		return this.lanes.getLaneOffsetEntryAt( s );

	}

	getLaneOffsets () {

		return this.lanes.getLaneOffsets();

	}

	getLaneOffsetValue ( s: number ): number {

		return this.lanes.getLaneOffsetValue( s );

	}

	getLaneSectionById ( id: number ) {

		return this.laneSections.find( laneSection => {

			return laneSection.id === id;

		} );

	}

	addGeometry ( geometry: TvAbstractRoadGeometry ) {

		if ( !this.planView ) this.addPlanView();

		this.geometries.push( geometry );

		this.length += geometry.length;

		this.computeLaneSectionLength();
	}

	addGeometryLine ( s: number, x: number, y: number, hdg: number, length: number ): TvLineGeometry {

		this.length += length;

		this.computeLaneSectionLength();

		return this._planView.addGeometryLine( s, x, y, hdg, length );

	}

	addGeometryArc ( s: number, x: number, y: number, hdg: number, length: number, curvature: number ): TvArcGeometry {

		this.length += length;

		this.computeLaneSectionLength();

		return this._planView.addGeometryArc( s, x, y, hdg, length, curvature );

	}

	addGeometryParamPoly (
		s: number, x: number, y: number, hdg: number, length: number,
		aU: number, bU: number, cU: number, dU: number,
		aV: number, bV: number, cV: number, dV: number
	) {

		this.length += length;

		this.computeLaneSectionLength();

		return this._planView.addGeometryParamPoly3( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV );

	}

	addGeometryPoly ( s: number, x: number, y: number, hdg: number, length: number, a: number, b: number, c: number, d: number ) {

		this.length += length;

		this.computeLaneSectionLength();

		return this._planView.addGeometryPoly3( s, x, y, hdg, length, a, b, c, d );

	}

	clearGeometries () {

		this.geometries.splice( 0, this.geometries.length );

		this.length = 0;

		this.computeLaneSectionLength();

	}

	public getRoadTypeAt ( s: number ): TvRoadTypeClass {

		// add a default type if none exists
		if ( !this.hasType ) this.setType( TvRoadType.TOWN, 40 );

		return TvUtils.checkIntervalArray( this.type, s ) as TvRoadTypeClass;
	}

	/**
	 * Remove any existing road model from the scene and its children
	 */
	public remove ( parent: GameObject ) {

		if ( this.spline ) this.spline.hide();

		parent.remove( this.gameObject );

		this.laneSections.forEach( laneSection => {

			if ( this.gameObject ) this.gameObject.remove( laneSection.gameObject );

			if ( this.gameObject ) laneSection.lanes.forEach( lane => laneSection.gameObject.remove( lane.gameObject ) );

		} );
	}

	addControlPoint ( point: AbstractControlPoint, updateGeometry = true ) {

		// point.mainObject = this;

		this.spline.addControlPoint( point );

		this.spline.update();

		// SceneService.addToolObject( point );

		// if ( updateGeometry ) this.updateGeometryFromSpline();
	}


	removeControlPoint ( cp: AbstractControlPoint ) {

		this.spline.removeControlPoint( cp );

		this.spline.update();

		// SceneService.removeFromTool( cp );

		// this.updateGeometryFromSpline();

	}

	updateGeometryFromSpline ( duringImport = false ) {

		// make length 0 because geometry will update road length again
		this.length = 0;

		this.spline.update();

		this.clearGeometries();

		this.spline.exportGeometries( duringImport ).forEach( geometry => {

			this.addGeometry( geometry );

		} );

	}

	getLeftSideWidth ( s: number ) {

		let width = 0;

		this.getLaneSectionAt( s ).getLeftLanes().forEach( lane => {
			width += lane.getWidthValue( s );
		} );

		return width;
	}

	getRightsideWidth ( s: number ) {

		let width = 0;

		this.getLaneSectionAt( s ).getRightLanes().forEach( lane => {
			width += lane.getWidthValue( s );
		} );

		return width;

	}

	getRoadWidthAt ( s: number ) {

		let leftWidth = 0, rightWidth = 0;

		const laneSection = this.getLaneSectionAt( s );

		if ( !laneSection ) {

			return {
				totalWidth: 0,
				leftSideWidth: 0,
				rightSideWidth: 0
			};

		}

		laneSection
			.getLeftLanes()
			.forEach( lane => leftWidth += lane.getWidthValue( s ) );

		laneSection
			.getRightLanes()
			.forEach( lane => rightWidth += lane.getWidthValue( s ) );

		return {
			totalWidth: leftWidth + rightWidth,
			leftSideWidth: leftWidth,
			rightSideWidth: rightWidth,
		};
	}

	getElevationAt ( s: number ): TvElevation {

		return TvUtils.checkIntervalArray( this.elevationProfile.elevation, s );

	}

	getCoordAt ( point: Vector3 ): TvPosTheta {

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

	getReferenceLinePoints ( step = 1.0 ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		for ( let s = 0; s <= this.length; s += step ) {

			points.push( this.getRoadCoordAt( s ) );

		}

		points.push( this.getRoadCoordAt( this.length - Maths.Epsilon ) );

		return points;
	}

	computeLaneSectionCoordinates () {

		// Compute lastSCoordinate for all laneSections
		for ( let i = 0; i < this.laneSections.length; i++ ) {

			const currentLaneSection = this.laneSections[ i ];

			// lastSCoordinate by default is equal to road length
			let lastSCoordinate = this.length;

			// if next laneSection exists let's use its sCoordinate
			if ( i + 1 < this.laneSections.length ) {
				lastSCoordinate = this.laneSections[ i + 1 ].s;
			}

			currentLaneSection.endS = lastSCoordinate;
		}

	}

	set roadStyle ( roadStyle: RoadStyle ) {

		this.lanes.clear();

		this.addLaneOffsetInstance( roadStyle.laneOffset.clone() );

		this.addLaneSectionInstance( roadStyle.laneSection.cloneAtS( 0 ) );

		this.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				MapEvents.laneUpdated.emit( lane );

			} );

		} )

	}

	get roadStyle (): RoadStyle {

		const roadStyle = new RoadStyle();

		roadStyle.laneOffset = this.getLaneOffsetAt( 0 ).clone();

		roadStyle.laneSection = this.getLaneSectionAt( 0 ).cloneAtS( 0, 0 )

		return roadStyle;

	}

	isPredecessor ( otherRoad: TvRoad ): boolean {

		if ( !this.predecessor ) return false;

		if ( this.predecessor.elementType === TvRoadLinkChildType.junction ) return false;

		return this.predecessor.elementId === otherRoad.id;
	}

	isSuccessor ( otherRoad: TvRoad ): boolean {

		if ( !this.successor ) return false;

		if ( this.successor.elementType === TvRoadLinkChildType.junction ) return false;

		return this.successor.elementId === otherRoad.id;
	}

	removeConnection ( otherRoad: TvRoad ) {

		if ( this.isPredecessor( otherRoad ) ) {

			this.predecessor = null;

		} else if ( this.isSuccessor( otherRoad ) ) {

			this.successor = null;

		}

		if ( otherRoad.isPredecessor( this ) ) {

			otherRoad.predecessor = null;

		} else if ( otherRoad.isSuccessor( this ) ) {

			otherRoad.successor = null;

		}

	}

	clone ( s: number ): TvRoad {

		const length = this.length - s;

		const road = new TvRoad( this.name, length, this.id, this.junction );

		road.spline = this.spline;
		road.type = this.type.map( type => type.clone() );
		road.sStart = this.sStart;
		road.drivingMaterialGuid = this.drivingMaterialGuid;
		road.sidewalkMaterialGuid = this.sidewalkMaterialGuid;
		road.borderMaterialGuid = this.borderMaterialGuid;
		road.shoulderMaterialGuid = this.shoulderMaterialGuid;
		road.trafficRule = this.trafficRule;
		road.planView = this._planView.clone();
		road.predecessor = this.predecessor?.clone();
		road.successor = this.successor?.clone();

		road.addLaneSectionInstance( this.getLaneSectionAt( s ).cloneAtS( 0, 0 ) );

		return road;

	}

	getLaneCenterPosition ( lane: TvLane, s: number, offset = 0 ) {

		const posTheta = this.getRoadCoordAt( s );

		const laneSection = this.getLaneSectionAt( s );

		const tDirection = lane.id > 0 ? 1 : -1;

		const cumulativeWidth = laneSection.getWidthUptoCenter( lane, s );

		const cosTheta = Math.cos( posTheta.hdg + Maths.M_PI_2 ) * tDirection;
		const sinTheta = Math.sin( posTheta.hdg + Maths.M_PI_2 ) * tDirection;

		posTheta.x += cosTheta * ( cumulativeWidth + offset );
		posTheta.y += sinTheta * ( cumulativeWidth + offset );

		return posTheta;
	}

	getLaneStartPosition ( lane: TvLane, s: number, offset = 0 ) {

		const posTheta = this.getRoadCoordAt( s );

		const laneSection = this.getLaneSectionAt( s );

		const tDirection = lane.id > 0 ? 1 : -1;

		const cumulativeWidth = laneSection.getWidthUptoStart( lane, s );

		const cosTheta = Math.cos( posTheta.hdg + Maths.M_PI_2 ) * tDirection;
		const sinTheta = Math.sin( posTheta.hdg + Maths.M_PI_2 ) * tDirection;

		posTheta.x += cosTheta * ( cumulativeWidth + offset );
		posTheta.y += sinTheta * ( cumulativeWidth + offset );

		return posTheta;
	}

	getLaneEndPosition ( lane: TvLane, s: number, offset = 0 ) {

		const posTheta = this.getRoadCoordAt( s );

		const laneSection = this.getLaneSectionAt( s );

		const tDirection = lane.id > 0 ? 1 : -1;

		const cumulativeWidth = laneSection.getWidthUptoEnd( lane, s );

		const cosTheta = Math.cos( posTheta.hdg + Maths.M_PI_2 ) * tDirection;
		const sinTheta = Math.sin( posTheta.hdg + Maths.M_PI_2 ) * tDirection;

		posTheta.x += cosTheta * ( cumulativeWidth + offset );
		posTheta.y += sinTheta * ( cumulativeWidth + offset );

		return posTheta;
	}

	getLaneAt ( s: number, t: number ): TvLane {

		return this.getLaneSectionAt( s ).getLaneAt( s, t );

	}

	private getGeometryAt ( s: number ): TvAbstractRoadGeometry {

		const geometry = TvUtils.checkIntervalArray( this.geometries, s );

		if ( geometry == null ) {

			SnackBar.error( `GeometryNotFoundAt ${ s } RoadId:${ this.id }` );

			return;
		}

		return geometry;

	}

	private computeLaneSectionLength () {

		this.computeLaneSectionCoordinates();

		const sections = this.getLaneSections();

		if ( sections.length == 0 ) return;

		// update first, not required
		// if ( sections.length == 1 ) sections[ 0 ].length = this.length;

		for ( let i = 1; i < sections.length; i++ ) {

			const current = sections[ i ];
			const previous = sections[ i - 1 ];

			previous.length = current.s - previous.s;
		}

		// update last
		sections[ sections.length - 1 ].length = this.length - sections[ sections.length - 1 ].s;
	}
}
