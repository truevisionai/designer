/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { SentryService } from 'app/core/analytics/sentry.service';
import { GameObject } from 'app/core/game-object';
import { SceneService } from 'app/core/services/scene.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { TvConsole } from 'app/core/utils/console';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { SnackBar } from 'app/services/snack-bar.service';
import { Maths } from 'app/utils/maths';
import { MathUtils, Vector2, Vector3 } from 'three';
import { LaneOffsetNode } from '../../three-js/objects/lane-offset-node';
import { LaneRoadMarkNode } from '../../three-js/objects/lane-road-mark-node';
import { LaneWidthNode } from '../../three-js/objects/lane-width-node';
import { TvMapBuilder } from '../builders/tv-map-builder';
import { TvAbstractRoadGeometry } from './geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from './geometries/tv-arc-geometry';
import { TvLineGeometry } from './geometries/tv-line-geometry';
import { TvContactPoint, TvDynamicTypes, TvOrientation, TvRoadType, TvUnit } from './tv-common';
import { TvElevation } from './tv-elevation';
import { TvElevationProfile } from './tv-elevation-profile';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvLane } from './tv-lane';
import { TvLaneSection } from './tv-lane-section';
import { TvLateralProfile } from './tv-lateral.profile';
import { TvPlaneView } from './tv-plane-view';
import { TvPosTheta } from './tv-pos-theta';
import { TvRoadLaneOffset } from './tv-road-lane-offset';
import { TvRoadLanes } from './tv-road-lanes';
import { TvRoadLinkChild, TvRoadLinkChildType } from './tv-road-link-child';
import { TvRoadLinkNeighbor } from './tv-road-link-neighbor';
import { TvObjectContainer, TvRoadObject } from './tv-road-object';
import { TvRoadSignal } from './tv-road-signal.model';
import { TvRoadTypeClass } from './tv-road-type.class';
import { TvRoadLink } from './tv-road.link';
import { TvUtils } from './tv-utils';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { RoadStyle } from 'app/services/road-style.service';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { TvJunction } from './tv-junction';
import { TvMapInstance } from '../services/tv-map-source-file';

export enum TrafficRule {
	RHT = 'RHT',
	LHT = 'LHT'
}

export class TvRoad {

	public readonly uuid: string;

	public updated = new EventEmitter<TvRoad>();

	// auto will be the default spline for now
	public spline: AbstractSpline;

	public startNode: RoadNode;
	public endNode: RoadNode;

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

	public junctionId: number;

	/**
	 * @deprecated use predecessor, successor directly
	 */
	private link: TvRoadLink;
	private lastAddedLaneSectionIndex: number;
	private lastAddedRoadObjectIndex: number;
	private lastAddedRoadSignalIndex: number;

	public static counter = 1;

	constructor ( name: string, length: number, id: number, junctionId: number ) {

		TvRoad.counter++;

		this.uuid = MathUtils.generateUUID();
		this._name = name;
		this._length = length;
		this._id = id;
		this.junctionId = junctionId;

		this.spline = new AutoSpline( this );

	}

	private _objects: TvObjectContainer = new TvObjectContainer();

	get objects (): TvObjectContainer {
		return this._objects;
	}

	set objects ( value: TvObjectContainer ) {
		this._objects = value;
	}

	private _signals: Map<number, TvRoadSignal> = new Map<number, TvRoadSignal>();

	get signals (): Map<number, TvRoadSignal> {
		return this._signals;
	}

	set signals ( value: Map<number, TvRoadSignal> ) {
		this._signals = value;
	}

	private _planView = new TvPlaneView;

	get planView (): TvPlaneView {
		return this._planView;
	}

	set planView ( value: TvPlaneView ) {
		this._planView = value;
	}

	private _neighbors: TvRoadLinkNeighbor[] = [];

	get neighbors (): TvRoadLinkNeighbor[] {
		return this._neighbors;
	}

	set neighbors ( value: TvRoadLinkNeighbor[] ) {
		this._neighbors = value;
	}

	private _name: string;

	get name (): string {
		return this._name;
	}

	set name ( value: string ) {
		this._name = value;
	}

	private _length: number;

	get length (): number {
		return this._length;
	}

	set length ( value: number ) {
		this._length = value;
	}

	private _id: number;

	get id (): number {
		return this._id;
	}

	set id ( value: number ) {
		this._id = value;
	}

	get junctionInstance (): TvJunction {
		return TvMapInstance.map.getJunctionById( this.junctionId );
	}

	private _gameObject: GameObject;

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

	hide () {

		if ( this.gameObject ) this.gameObject.visible = false;

	}

	show () {

		if ( this.gameObject ) this.gameObject.visible = true;

	}

	onSuccessorUpdated ( successor: TvRoad ) {

		console.log( 'successor of', this.id, 'updated' );

	}

	onPredecessorUpdated ( predecessor: TvRoad ) {

		console.log( 'predecssor of', this.id, 'updated' );

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

	setNeighbor ( side: string, elementId: string, direction: string ) {

		console.error( 'neighbor not supported' );

		// const neighbor = new OdRoadLinkNeighbor( side, elementId, direction );
		//
		// this.link.neighbor.push( neighbor );
		//
		// if ( this.neighbor1 === null ) {
		//
		//     this.neighbor1 = neighbor;
		//
		// }
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

		if ( index > this.getElevationCount() ) {

			this.addElevationInstance( new TvElevation( s, a, b, c, d ) );

		} else {

			this.elevationProfile.elevation[ index ] = new TvElevation( s, a, b, c, d );

		}
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

	checkSuperElevationInterval ( s: number ) {
		// TODO
	}

	checkCrossfallInterval ( s: number ) {
		// TODO
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

		this.computeLaneSectionLength();
	}

	clearLaneSections () {

		this.laneSections.splice( 0, this.laneSections.length );

	}

	addGetLaneSection ( s: number, singleSide: boolean = false ): TvLaneSection {

		const laneSections = this.getLaneSections();

		const laneSectionId = laneSections.length + 1;

		const laneSection = new TvLaneSection( laneSectionId, s, singleSide, this );

		laneSections.push( laneSection );

		this.computeLaneSectionLength();

		this.lastAddedLaneSectionIndex = laneSections.length - 1;

		return laneSection;
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

		// helps catch bugs
		if ( this.geometries.length == 0 ) {
			throw new Error( 'NoGeometriesFound' );
		}

		if ( s == null ) TvConsole.error( 's is undefined' );

		if ( s > this.length || s < 0 ) TvConsole.warn( 's is greater than road length or less than 0' );

		const geometry = this.getGeometryAt( s );

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

	// TODO: Fix this
	getCrossfallValue ( s: number, angleLeft: number, angleRight: number ): number {

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
		type: string,
		name: string,
		id: number,
		s: number,
		t: number,
		zOffset: number,
		validLength: number,
		orientation: TvOrientation,
		length: number,
		width: number,
		radius: number,
		height: number,
		hdg: number,
		pitch: number,
		roll: number
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

		this.addRoadObjectInstance( obj );

		return obj;
	}

	addRoadObjectInstance ( roadObject: TvRoadObject ) {

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

	getLaneWidth ( sCoordinate: number, laneId: number ): number {

		// TODO: Fix lanesection finding
		const laneSection = this.lanes.getLaneSectionAt( sCoordinate );

		const lane = laneSection.getLaneById( laneId );

		return lane.getWidthValue( sCoordinate );
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

	getWidthUptoStart ( s: number, lane: TvLane ) {

		const laneSection = this.getLaneSectionAt( s );

		return laneSection.getWidthUptoStart( lane, s );

	}

	getWidthUptoCenter ( s: number, lane: TvLane ) {

		const laneSection = this.getLaneSectionAt( s );

		return laneSection.getWidthUptoCenter( lane, s );

	}

	getWidthUptoEnd ( s: number, lane: TvLane ) {

		const laneSection = this.getLaneSectionAt( s );

		return laneSection.getWidthUptoEnd( lane, s );

	}

	getSuccessorRoad ( connection: TvJunctionConnection ) {

		if ( this.successor.elementType == 'road' ) {

		} else if ( this.successor.elementType == 'junction' ) {

		} else {

		}

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

	public removeGeometryByUUID ( uuid: string ) {

		this.length += length;

		// find the index of geometry and remove it from the road
		this.geometries.splice( this.geometries.findIndex( geom => geom.uuid === uuid ), 1 );

	}

	public getRoadTypeAt ( s: number ): TvRoadTypeClass {

		// add a default type if none exists
		if ( !this.hasType ) this.setType( TvRoadType.TOWN, 40 );

		return TvUtils.checkIntervalArray( this.type, s ) as TvRoadTypeClass;
	}

	public findMaxSpeedAt ( s: number, laneId?: number ) {

		let maxSpeed = null;

		// get max-speed as per road
		const type = this.getRoadTypeAt( s );

		const maxSpeedAsPerRoad = type ? type.speed.inkmph() : Number.POSITIVE_INFINITY;

		// check if lane-speed record exists
		if ( laneId ) {

			// const laneSpeedRecord = this.getLaneSectionAt( s ).getLaneById( laneId ).getLaneSpeedAt( s );
			const laneSpeedRecord = Number.MAX_VALUE;

			maxSpeed = Math.min( maxSpeedAsPerRoad, laneSpeedRecord );

		} else {

			maxSpeed = maxSpeedAsPerRoad;

		}

		return maxSpeed;
	}

	// private checkGeometryInterval ( sCheck: any ) {
	//
	//     let index = -999;
	//
	//     for ( let i = 0; i < this._planView.geometries.length; i++ ) {
	//
	//         const odGeometry = this._planView.geometries[ i ];
	//
	//         if ( odGeometry.s <= sCheck ) {
	//             index = i;
	//         }
	//
	//         // if ( ( sCheck >= odGeometry.s ) && ( sCheck <= odGeometry.s2 ) ) {
	//         //     return i;
	//         // }
	//     }
	//
	//     return index;
	// }

	// private checkLaneSectionInterval ( s: number ) {
	//
	//     let res = -1;
	//
	//     for ( let i = 0; i < this.lanes.laneSection.length; i++ ) {
	//
	//         // check if the s belongs to the current record
	//         if ( this.lanes.laneSection[ i ].checkInterval( s ) ) {
	//
	//             res = i;
	//
	//         } else {
	//
	//             break;
	//
	//         }
	//
	//     }
	//
	//     return res;
	//
	// }

	private getGeometryAt ( s: number ): TvAbstractRoadGeometry {

		const geometry = TvUtils.checkIntervalArray( this.geometries, s );

		if ( geometry == null ) {

			SentryService.captureException( new Error( `GeometryErrorWithFile S:${ s } RoadId:${ this.id }` ) );

			SnackBar.error( `GeometryNotFoundAt ${ s } RoadId:${ this.id }` );

			return;
		}

		return geometry;

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

	showHelpers (): void {

		this.spline.show();

		this.showNodes();

	}

	hideHelpers (): void {

		this.spline.hide();

		this.hideNodes();

	}

	showSpline (): void {

		this.spline.show();

	}

	hideSpline (): void {

		this.spline.hide();

	}

	showControlPoints (): void {

		this.spline.showControlPoints();

	}

	hideControlPoints (): void {

		this.spline.hideControlPoints();

	}

	showNodes (): any {

		if ( this.startNode ) this.startNode.visible = true;
		if ( this.endNode ) this.endNode.visible = true;

	}

	hideNodes (): void {

		if ( this.startNode ) this.startNode.visible = false;
		if ( this.endNode ) this.endNode.visible = false;

	}

	addControlPoint ( point: RoadControlPoint, updateGeometry = true ) {

		point.mainObject = this;

		this.spline.addControlPoint( point );

		SceneService.add( point );

		if ( updateGeometry ) this.updateGeometryFromSpline();
	}

	addControlPointAt ( position: Vector3, udpateGeometry = true ) {

		const point = new RoadControlPoint( this, position, 'cp', 0, 0 );

		this.addControlPoint( point, udpateGeometry );

		return point;

	}

	updateGeometryFromSpline ( duringImport = false ) {

		// make length 0 because geometry will update road length again
		this.length = 0;

		this.spline.update();

		this.clearGeometries();

		this.spline.exportGeometries( duringImport ).forEach( geometry => {

			this.addGeometry( geometry );

		} );

		this.updated.emit( this );
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

	updateRoadNodes (): void {

		this.updateGeometryFromSpline();

		if ( !this.startNode ) {
			this.startNode = this.createRoadNode( TvContactPoint.START );
		} else {
			this.startNode.update();
		}


		if ( !this.endNode ) {
			this.endNode = this.createRoadNode( TvContactPoint.END );
		} else {
			this.endNode.update();
		}
	}


	private createRoadNode ( contact: TvContactPoint ) {

		const node = new RoadNode( this, contact );

		SceneService.add( node );

		return node;
	}

	clearNodes () {

		SceneService.remove( this.startNode );
		SceneService.remove( this.endNode );

		this.startNode = null;
		this.endNode = null;

		delete this.startNode;
		delete this.endNode;

	}

	getRoadWidthAt ( s: number ) {

		let leftWidth = 0, rightWidth = 0;

		this.getLaneSectionAt( s )
			.getLeftLanes()
			.forEach( lane => leftWidth += lane.getWidthValue( s ) );

		this.getLaneSectionAt( s )
			.getRightLanes()
			.forEach( lane => rightWidth += lane.getWidthValue( s ) );

		return {
			totalWidth: leftWidth + rightWidth,
			leftSideWidth: leftWidth,
			rightSideWidth: rightWidth,
		};
	}

	showLaneOffsetNodes () {

		this.getLaneOffsets().forEach( laneOffset => {

			if ( laneOffset.node ) {

				laneOffset.node.updatePosition();

				laneOffset.node.visible = true;

				SceneService.add( laneOffset.node );

			} else {

				laneOffset.node = new LaneOffsetNode( this, laneOffset );

				SceneService.add( laneOffset.node );

			}

		} );

	}


	hideLaneOffsetNodes () {

		this.getLaneOffsets().forEach( laneOffset => {

			if ( laneOffset.node ) {

				laneOffset.node.visible = false;

				SceneService.remove( laneOffset.node );

			}

		} );

	}

	updateLaneMaterial () {

		this.laneSections.forEach( section => {

			section.lanes.forEach( lane => {

				lane.gameObject.material = TvMapBuilder.getLaneMaterial( this, lane );

			} );

		} );

	}

	public showLaneMarkingNodes () {

		this.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				lane.getRoadMarks().forEach( roadmark => {

					if ( roadmark.node ) {

						roadmark.node.visible = true;

					} else {

						roadmark.node = new LaneRoadMarkNode( lane, roadmark );

						SceneService.add( roadmark.node );

					}

				} );

			} );

		} );
	}

	public hideLaneMarkingNodes () {

		this.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				lane.getRoadMarks().forEach( roadmark => {

					if ( roadmark.node ) roadmark.node.visible = false;

				} );

			} );

		} );

	}

	public hideWidthNodes () {

		this.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				lane.getLaneWidthVector().forEach( laneWidth => {

					if ( laneWidth.node ) laneWidth.node.visible = false;

				} );

			} );

		} );
	}

	public showWidthNodes () {

		this.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				lane.getLaneWidthVector().forEach( laneWidth => {

					if ( laneWidth.node ) SceneService.remove( laneWidth.node );

					laneWidth.node = new LaneWidthNode( laneWidth );

					SceneService.add( laneWidth.node );

				} );

			} );

		} );

	}

	showElevationNodes () {

		this.getElevationProfile().getElevations().forEach( elevation => {

			if ( elevation.node ) {

				elevation.node.visible = true;

			} else {

				elevation.node = new RoadElevationNode( this, elevation );

			}

			SceneService.add( elevation.node );

		} );

	}

	updateElevationNodes () {

		this.getElevationProfile().getElevations().forEach( elevation => {

			elevation.node?.updateValuesAndPosition();

		} );

	}

	hideElevationNodes () {

		this.getElevationProfile().getElevations().forEach( elevation => {

			if ( elevation.node ) {

				elevation.node.visible = false;

			}

			SceneService.remove( elevation.node );

		} );

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

		// // Compute lastSCoordinate for all laneSections
		// for ( let i = 0; i < this.laneSections.length; i++ ) {
		//
		// 	const currentLaneSection = this.laneSections[ i ];
		//
		// 	// by default it is equal to road lenght
		// 	let lastSCoordinate = 0;
		//
		// 	// if next laneSection exists lets use its sCoordinate
		// 	if ( i + 1 < this.laneSections.length ) {
		//
		// 		const nextLaneSection = this.laneSections[ i + 1 ];
		// 		lastSCoordinate = nextLaneSection.attr_s;
		//
		// 	} else {
		//
		//
		// 		lastSCoordinate = this.length;
		// 	}
		//
		// 	currentLaneSection.lastSCoordinate = lastSCoordinate;
		// }

	}

	applyRoadStyle ( roadStyle: RoadStyle ) {

		this.lanes.clear()

		this.addLaneOffsetInstance( roadStyle.laneOffset.clone() );

		this.addLaneSectionInstance( roadStyle.laneSection.cloneAtS( 0 ) );

		RoadFactory.rebuildRoad( this );
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

	}

}
