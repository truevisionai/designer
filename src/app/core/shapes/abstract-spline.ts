/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import * as THREE from 'three';
import { MathUtils, Vector2, Vector3 } from 'three';
import { SceneService } from '../../services/scene.service';
import { AutoSplinePath, ExplicitSplinePath } from './cubic-spline-curve';
import { RoadSegment } from './RoadSegment';
import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";

export abstract class AbstractSpline {

	public uuid: string;

	abstract type: string;

	public controlPoints: AbstractControlPoint[] = [];

	protected controlPointAdded = new EventEmitter<AbstractControlPoint>();

	protected controlPointRemoved = new EventEmitter<AbstractControlPoint>();

	protected meshAddedInScene: boolean;

	protected roadSegments: RoadSegment[] = [];

	constructor ( public closed = true, public tension = 0.5 ) {

		this.uuid = MathUtils.generateUUID();

		this.init();

	}

	get controlPointPositions (): Vector3[] {
		return this.controlPoints.map( point => point.position );
	}

	abstract init (): void;

	abstract hide (): void;

	abstract show (): void;

	abstract hideLines (): void;

	abstract showLines (): void;

	abstract update (): void;

	abstract exportGeometries ( duringImport?: boolean ): TvAbstractRoadGeometry[];

	abstract getPoint ( t: number, offset: number ): Vector3;

	abstract getLength (): number;

	clone () {

		const spline: AbstractSpline = new ( this.constructor as any )( this.closed, this.tension );

		spline.uuid = this.uuid;

		this.controlPoints.forEach( cp => spline.addControlPointAt( cp.position ) );

		this.roadSegments.forEach( segment => spline.addRoadSegment( segment.start, segment.roadId ) );

		spline.type = this.type;

		spline.init();

		return spline;

	}


	clear () {

		throw new Error( 'Method not implemented.' );

	}

	addControlPoint ( cp: AbstractControlPoint ) {

		this.controlPoints.push( cp );

	}

	addControlPoints ( points: AbstractControlPoint[] ): void {

		points.forEach( point => this.addControlPoint( point ) );

	}

	addControlPointAtNew ( position: Vector3 ): AbstractControlPoint {

		throw new Error( 'method not implemented' );

	}

	getFirstPoint () {

		return this.controlPoints[ 0 ];

	}

	getSecondPoint () {

		try {

			return this.controlPoints[ 1 ];

		} catch ( error ) {

		}

	}

	getLastPoint () {

		return this.controlPoints[ this.controlPoints.length - 1 ];

	}

	getSecondLastPoint () {

		try {

			return this.controlPoints[ this.controlPoints.length - 2 ];

		} catch ( error ) {

		}

	}

	removeControlPoint ( cp: AbstractControlPoint ) {

		const index = this.controlPoints.findIndex( p => p.id === cp.id );

		this.controlPoints.splice( index, 1 );
	}

	hideControlPoints () {

		this.controlPoints.forEach( i => SceneService.removeFromTool( i ) );

	}

	showControlPoints () {

		this.controlPoints.forEach( i => SceneService.addToolObject( i ) );

	}

	getArcParams ( p1: Vector2, p2: Vector2, dir1: Vector2, dir2: Vector2 ): number[] {

		const distance = p1.distanceTo( p2 );

		const normalisedDotProduct = new THREE.Vector2()
			.copy( dir1 )
			.normalize()
			.dot( new THREE.Vector2().copy( dir2 ).normalize() );

		const alpha = Math.acos( normalisedDotProduct );

		const r = distance / 2 / Math.sin( alpha / 2 );

		const length = r * alpha;

		const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

		const det = 1 / ( ma * md - mb * mc );

		const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

		const p2proj = new THREE.Vector2().subVectors( p2, p1 );

		p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

		return [ r, alpha, length, Math.sign( p2proj.y ) ];
	}

	/**
	 *
	 * @deprecated dont use this make another internal for any sub class
	 * @param tag
	 * @param id
	 * @param cpobjidx
	 */
	createControlPoint ( tag: 'cp' | 'tpf' | 'tpb', id: number, cpobjidx?: any ): AbstractControlPoint {

		throw new Error( 'Method not implemented.' );

		// // let cptobj = new THREE.Mesh( this.tcboxgeometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
		// // let controlPointObject = new BaseControlPoint( null, new Vector3(), tag, id, cpobjidx );

		// controlPointObject[ 'tag' ] = tag;
		// controlPointObject[ 'tagindex' ] = id;

		// controlPointObject.userData.is_button = true;
		// controlPointObject.userData.is_control_point = true;
		// controlPointObject.userData.is_selectable = true;

		// SceneService.addToolObject( controlPointObject );

		// if ( cpobjidx == undefined ) {
		// 	this.controlPoints.push( controlPointObject );
		// } else {
		// 	this.controlPoints.splice( cpobjidx, 0, controlPointObject );
		// }

		// this.controlPointAdded.emit( controlPointObject );

		// return controlPointObject;
	}

	getPath ( offset: number = 0 ) {
		if ( this.type == 'auto' ) {
			return new AutoSplinePath( this as any, offset );
		} else if ( this.type == 'explicit' ) {
			return new ExplicitSplinePath( this as any, offset );
		}
	}

	getPoints ( step: number ) {

		const points: Vector3[] = [];

		const length = this.getLength();

		const d = step / length;

		for ( let i = 0; i <= 1; i += d ) {

			points.push( this.getPoint( i, 0 ) );

		}

		return points;
	}

	addRoadSegment ( start: number, roadId: number ) {

		if ( start == null ) throw new Error( 'start is null' );

		// check if road segment already exists
		if ( this.roadSegments.find( i => i.roadId == roadId ) ) return;

		const exists = this.roadSegments.find( seg => seg.start == start );

		if ( exists ) {

			exists.roadId = roadId;

		} else {

			this.roadSegments.push( { start: start, roadId: roadId, geometries: [] } );

		}

		// sort road segment by start
		this.roadSegments.sort( ( a, b ) => a.start - b.start );

		this.update();

	}

	updateRoadSegments () { }

	removeRoadSegment ( segment: RoadSegment ) {

		this.roadSegments = this.roadSegments.filter( i => i != segment );

	}

	removeRoadSegmentByRoadId ( roadId: number ) {

		this.roadSegments = this.roadSegments.filter( segment => segment.roadId != roadId );

	}

	getRoadSegments (): RoadSegment[] {

		return this.roadSegments;

	}

	addControlPointAt ( position: Vector3 ): AbstractControlPoint {

		throw new Error( 'Method not implemented.' );

	}

}


