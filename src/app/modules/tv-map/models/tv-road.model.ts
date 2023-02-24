/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { GameObject } from 'app/core/game-object';
import { SceneService } from 'app/core/services/scene.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { SnackBar } from 'app/services/snack-bar.service';
import { Maths } from 'app/utils/maths';
import { MathUtils, Vector3 } from 'three';
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
import { TvRoadLinkChild } from './tv-road-link-child';
import { TvRoadLinkNeighbor } from './tv-road-link-neighbor';
import { TvObjectContainer, TvRoadObject } from './tv-road-object';
import { TvRoadSignal } from './tv-road-signal.model';
import { TvRoadTypeClass } from './tv-road-type.class';
import { TvRoadLink } from './tv-road.link';
import { TvUtils } from './tv-utils';
import { TvRoadTypeClass } from './tv-road-type.class';
import { SnackBar } from 'app/services/snack-bar.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { AutoSpline } from 'app/core/shapes/auto-spline';
import { TvRoadLaneOffset } from './tv-road-lane-offset';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { Maths } from 'app/utils/maths';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { Vector3, Math as MathUtils } from 'three';
import { SceneService } from 'app/core/services/scene.service';
import { EventEmitter } from '@angular/core';
import { TvPointMarking } from './tv-point-road-marking';

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
    public lanes = new TvRoadLanes();

    public drivingMaterialGuid: string;
    public sidewalkMaterialGuid: string;
    public borderMaterialGuid: string;
    public shoulderMaterialGuid: string;

    public pointMarkings: TvPointMarking[] = [];

    /**
     * @deprecated use predecessor, successor directly
     */
    private link: TvRoadLink;
    private lastAddedLaneSectionIndex: number;
    private lastAddedRoadObjectIndex: number;
    private lastAddedRoadSignalIndex: number;

    constructor ( name: string, length: number, id: number, junction: number ) {

        this.uuid = MathUtils.generateUUID();
        this._name = name;
        this._length = length;
        this._id = id;
        this._junction = junction;

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

    private _predecessor: TvRoadLinkChild;

    get predecessor (): TvRoadLinkChild {
        return this._predecessor;
    }

    set predecessor ( value: TvRoadLinkChild ) {
        this._predecessor = value;
    }

    private _successor: TvRoadLinkChild;

    get successor (): TvRoadLinkChild {
        return this._successor;
    }

    set successor ( value: TvRoadLinkChild ) {
        this._successor = value;
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

    private _junction: number;

    get junction (): number {
        return this._junction;
    }

    set junction ( value: number ) {
        this._junction = value;
    }

    private _gameObject: GameObject;

    get gameObject () {
        return this._gameObject;
    }

    set gameObject ( value ) {
        this._gameObject = value;
    }

    get isJunction (): boolean {
        return this._junction !== -1;
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

    onSuccessorUpdated ( successor: TvRoad ) {

        console.log( 'successor of', this.id, 'updated' );

    }

    onPredecessorUpdated ( predecessor: TvRoad ) {

        console.log( 'predecssor of', this.id, 'updated' );

    }

    setPredecessor ( elementType: 'road' | 'junction', elementId: number, contactPoint?: TvContactPoint ) {

        if ( this._predecessor == null ) {

            this._predecessor = new TvRoadLinkChild( elementType, elementId, contactPoint );

        }
    }

    getPositionAt ( s: number, t: number = 0 ): TvPosTheta {

        const pose = new TvPosTheta;

        this.getGeometryCoordsAt( s, t, pose );

        return pose;
    }

    getRoadPosition ( s: number ) {

        return this.getPositionAt( s, 0 );

    }

    endPosition () {

        return this.getRoadPosition( this.length - Maths.Epsilon );

    }

    endCoord () {

        return this.getPositionAt( this.length - Maths.Epsilon, 0 );

    }

    startPosition () {

        return this.getRoadPosition( 0 );

    }

    setType ( type: TvRoadType, maxSpeed: number = 40, unit: TvUnit = TvUnit.MILES_PER_HOUR ) {

        this.type.push( new TvRoadTypeClass( 0, type, maxSpeed, unit ) );

    }

    setSuccessor ( elementType: string, elementId: number, contactPoint?: TvContactPoint ) {

        if ( this._successor == null ) {

            this._successor = new TvRoadLinkChild( elementType, elementId, contactPoint );

        }
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

            this.elevationProfile.elevation.push( new TvElevation( s, a, b, c, d ) );

        } else {

            this.elevationProfile.elevation[ index ] = new TvElevation( s, a, b, c, d );

        }
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

        // TODO: Check for interval

        // this.lanes = new OdRoadLanes();

        const laneSectionId = this.lanes.laneSections.length + 1;

        this.lanes.laneSections.push( new TvLaneSection( laneSectionId, s, singleSide, this.id ) );

        this.updateLaneSections();

        this.lastAddedLaneSectionIndex = this.lanes.laneSections.length - 1;

        return this.lastAddedLaneSectionIndex;
    }

    addLaneSectionInstance ( laneSection: TvLaneSection ) {

        laneSection.roadId = this.id;

        laneSection.lanes.forEach( lane => {

            lane.roadId = this.id;

            lane.laneSectionId = laneSection.id;

        } );

        this.laneSections.push( laneSection );

    }

    clearLaneSections () {

        this.laneSections.splice( 0, this.laneSections.length );

    }

    addGetLaneSection ( s: number, singleSide: boolean = false ): TvLaneSection {

        const laneSectionId = this.lanes.laneSections.length + 1;

        const laneSection = new TvLaneSection( laneSectionId, s, singleSide, this.id );

        this.lanes.laneSections.push( laneSection );

        this.updateLaneSections();

        this.lastAddedLaneSectionIndex = this.lanes.laneSections.length - 1;

        return laneSection;
    }

    getLaneSectionCount () {

        return this.lanes.laneSections.length;

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

    getLanes (): TvRoadLanes {

        return this.lanes;

    }

    recalculateGeometry () {

        // Goes through geometry blocks and recalculates their coordinates and
        // headings starting with the second record
        // so the second geometry will start at the coordinates where the first one ended

        let length = 0;
        const lGeometryVectorSize = this._planView.geometries.length;

        if ( lGeometryVectorSize > 0 ) {

            const s = 0;
            const posTheta = new TvPosTheta( 0, 0, 0 );

            const abstractRoadGeometry = this._planView.geometries[ 0 ];

            length += this._planView.getBlockLength();

            abstractRoadGeometry.getCoords( s, posTheta );
        }
    }

    getGeometryCoords ( s: number, odPosTheta: TvPosTheta ): number {

        if ( s == null || s == undefined ) console.error( 's is undefined' );

        if ( s > this.length || s < 0 ) console.warn( 's is greater than road length or less than 0' );

        const geometry = this.getGeometryAt( s );

        if ( geometry == null ) {
            throw new Error( `geometry not found at s = ${ s }` );
        }

        const geometryType = geometry.getCoords( s, odPosTheta );

        if ( !geometryType ) console.error( 'geometry type not found' );

        const laneOffset = this.getLaneOffsetValue( s );

        odPosTheta.addLateralOffset( laneOffset );

        return geometryType;

        // const index = this.checkGeometryInterval( sCheck );
        //
        // if ( index === -999 ) {
        //     throw new Error( 'geometry index not found ' );
        // }
        //
        // // Check the block and get coords.
        // const res = this.planView.geometries[ index ].getCoords( sCheck, odPosTheta );
        //
        // const laneOffset = this.lanes.getLaneOffsetValue( sCheck );
        //
        // odPosTheta.addLateralOffset( laneOffset );
        //
        // // If the returned value is one of the geometry types (for 0=line,1=arc and 2=spiral)
        // // then the result has been found and parameters filled, so, return the value
        // if ( res > 0 ) {
        //     return res;
        // }
        //
        // // if s_check does not belong to the road, return -999
        // return -999;
    }

    getGeometryCoordsAt ( sCheck, t, odPosTheta: TvPosTheta ): number {

        const res = this.getGeometryCoords( sCheck, odPosTheta );

        odPosTheta.addLateralOffset( t );

        // If the returned value is one of the geometry types (for 0=line,1=arc and 2=spiral)
        // then the result has been found and parameters filled, so, return the value
        if ( res > 0 ) {
            return res;
        }

        // if s_check does not belong to the road, return -999
        return -999;
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

    addLaneOffset ( s: number, a: number, b: number, c: number, d: number ) {

        this.lanes.addLaneOffsetRecord( s, a, b, c, d );

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

        return this.lanes.laneSections.find( laneSection => {

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

        if ( this._successor.elementType == 'road' ) {

        } else if ( this._successor.elementType == 'junction' ) {

        } else {

        }

    }

    addGeometry ( geometry: TvAbstractRoadGeometry ) {

        if ( !this.planView ) this.addPlanView();

        this.geometries.push( geometry );

        this.length += geometry.length;

        this.updateLaneSections();
    }

    addGeometryLine ( s: number, x: number, y: number, hdg: number, length: number ): TvLineGeometry {

        this.length += length;

        this.updateLaneSections();

        return this._planView.addGeometryLine( s, x, y, hdg, length );

    }

    addGeometryArc ( s: number, x: number, y: number, hdg: number, length: number, curvature: number ): TvArcGeometry {

        this.length += length;

        this.updateLaneSections();

        return this._planView.addGeometryArc( s, x, y, hdg, length, curvature );

    }

    addGeometryParamPoly (
        s: number, x: number, y: number, hdg: number, length: number,
        aU: number, bU: number, cU: number, dU: number,
        aV: number, bV: number, cV: number, dV: number
    ) {

        this.length += length;

        this.updateLaneSections();

        return this._planView.addGeometryParamPoly3( s, x, y, hdg, length, aU, bU, cU, dU, aV, bV, cV, dV );

    }

    addGeometryPoly ( s: number, x: number, y: number, hdg: number, length: number, a: number, b: number, c: number, d: number ) {

        this.length += length;

        this.updateLaneSections();

        return this._planView.addGeometryPoly3( s, x, y, hdg, length, a, b, c, d );

    }

    clearGeometries () {

        this.geometries.splice( 0, this.geometries.length );

        this.length = 0;

        this.updateLaneSections();

    }

    public removeGeometryByUUID ( uuid: string ) {

        this.length += length;

        // find the index of geometry and remove it from the road
        this.geometries.splice( this.geometries.findIndex( geom => geom.uuid === uuid ), 1 );

    }

    public getRoadTypeAt ( s: number ): TvRoadTypeClass {

        if ( !this.hasType ) return;

        return TvUtils.checkIntervalArray( this.type, s ) as TvRoadTypeClass;
    }

    public findMaxSpeedAt ( s: number, laneId?: number ) {

        let maxSpeed = null;

        // get max-speed as per road
        const type = TvUtils.checkIntervalArray( this.type, s ) as TvRoadTypeClass;

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

    public getGeometryAt ( s: number ): TvAbstractRoadGeometry {

        return TvUtils.checkIntervalArray( this.geometries, s );

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

	/**
	 * @deprecated currently not working need to fix
	 * @param s s-coordinate
	 */
    public split ( s: number ) {

        // TODO: not working, fix and complete

        const newRoad: TvRoad = new TvRoad( 'New', 0, 0, -1 );

        // divide geometry and clone other sections

        const geometry = this.getGeometryAt( s );

        const laneSection = this.getLaneSectionAt( s );

        const newLength = this.length - s;

        const posTheta = new TvPosTheta();

        geometry.getCoords( s, posTheta );

        if ( geometry instanceof TvLineGeometry ) {

            const newG = new TvLineGeometry( s, posTheta.x, posTheta.y, posTheta.hdg, newLength );

        } else if ( geometry instanceof TvArcGeometry ) {

            const newG = new TvArcGeometry( s, posTheta.x, posTheta.y, posTheta.hdg, newLength, geometry.curvature );

        } else {

            SnackBar.error( 'Cannot split this geometry' );

        }

        // divide laneSection

        const newLaneSection = newRoad.addLaneSection( 0, false );

        // const laneSectionsAfterS =

    }

    showNodes (): any {

        if ( this.startNode ) this.startNode.visible = true;
        if ( this.endNode ) this.endNode.visible = true;

    }

    hideNodes (): void {

        if ( this.startNode ) this.startNode.visible = false;
        if ( this.endNode ) this.endNode.visible = false;

    }

    addControlPoint ( point: RoadControlPoint ) {

        this.spline.addControlPoint( point );

        SceneService.add( point );
    }

    addControlPointAt ( position: Vector3 ) {

        this.addControlPoint( new RoadControlPoint( this, position, 'cp', 0, 0 ) );

    }

    updateGeometryFromSpline () {

        // make length 0 because geometry will update road length again
        this.length = 0;

        this.spline.update();

        this.clearGeometries();

        this.spline.exportGeometries().forEach( geometry => {

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

    private updateLaneSections () {

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

    private getElevationAt ( s: number ): TvElevation {

        return TvUtils.checkIntervalArray( this.elevationProfile.elevation, s );

    }

}
