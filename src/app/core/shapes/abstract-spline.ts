/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter } from '@angular/core';
import { TvAbstractRoadGeometry } from 'app/modules/tv-map/models/geometries/tv-abstract-road-geometry';
import * as THREE from 'three';
import { MathUtils, Vector2, Vector3 } from 'three';
import { AutoSplinePath, ExplicitSplinePath } from './cubic-spline-curve';
import { SplineSegment, SplineSegmentType } from './spline-segment';
import { AbstractControlPoint } from "../../modules/three-js/objects/abstract-control-point";
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';

export enum SplineType {
	AUTO = 'auto',
	AUTOV2 = 'autov2',
	EXPLICIT = 'explicit',
	CATMULLROM = 'catmullrom',
}

export abstract class AbstractSpline {

	public abstract type: SplineType;

	public abstract init (): void;

	public abstract hide (): void;

	public abstract show (): void;

	public abstract hideLines (): void;

	public abstract showLines (): void;

	public abstract update (): void;

	public abstract exportGeometries ( duringImport?: boolean ): TvAbstractRoadGeometry[];

	public abstract getPoint ( t: number, offset: number ): TvPosTheta;

	public abstract getLength (): number;

	public uuid: string;

	public boundingBox: THREE.Box3;

	public controlPoints: AbstractControlPoint[] = [];

	protected splineSegments: SplineSegment[] = [];

	constructor ( public closed = true, public tension = 0.5 ) {

		this.uuid = MathUtils.generateUUID();

		this.init();

	}

	get controlPointPositions (): Vector3[] {
		return this.controlPoints.map( point => point.position );
	}

	get segmentCount () {
		return this.getSplineSegments().length;
	}

	clone () {

		const spline: AbstractSpline = new ( this.constructor as any )( this.closed, this.tension );

		spline.uuid = this.uuid;

		this.controlPoints.forEach( cp => spline.addControlPointAt( cp.position ) );

		this.splineSegments.forEach( segment => spline.addSegmentSection(
			segment.start,
			segment.id,
			segment.type,
			segment.segment
		) );

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

		// this.controlPoints.forEach( i => SceneService.removeFromTool( i ) );

	}

	showControlPoints () {

		// this.controlPoints.forEach( i => SceneService.addToolObject( i ) );

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

		if ( this.type == SplineType.AUTO || this.type == SplineType.AUTOV2 ) {

			return new AutoSplinePath( this as any, offset );

		} else if ( this.type == 'explicit' ) {

			return new ExplicitSplinePath( this as any, offset );

		} else {

			throw new Error( 'Invalid spline type' );

		}

	}

	getPoints ( step: number ) {

		const points: Vector3[] = [];

		const length = this.getLength();

		if ( length == 0 ) return [];

		const d = step / length;

		for ( let i = 0; i <= 1; i += d ) {

			points.push( this.getPoint( i, 0 ).toVector3() );

		}

		return points;
	}

	getDirectedPoints ( step: number ) {

		const points: TvPosTheta[] = [];

		const length = this.getLength();

		if ( length == 0 ) return [];

		const d = step / length;

		for ( let i = 0; i <= 1; i += d ) {

			points.push( this.getPoint( i, 0 ) );

		}

		return points;
	}

	addSegmentSection ( sStart: number, id: number, type: SplineSegmentType, segment: TvRoad | TvJunction ) {

		if ( sStart == null ) return;

		// check if road segment already exists
		if ( this.splineSegments.find( i => i.id == id && i.type == type ) ) return;

		const exists = this.splineSegments.find( seg => seg.start == sStart );

		if ( exists ) {

			throw new Error( 'Segment already exists' );

		} else {

			this.splineSegments.push( new SplineSegment( sStart, type, segment ) );

		}

		// sort road segment by start
		this.splineSegments.sort( ( a, b ) => a.start - b.start );

		this.update();

	}

	addRoadSegment ( sStart: number, road: TvRoad ) {

		this.addSegmentSection( sStart, road.id, SplineSegmentType.ROAD, road );

	}

	addJunctionSegment ( sStart: number, juncton: TvJunction ) {

		this.addSegmentSection( sStart, juncton.id, SplineSegmentType.JUNCTION, juncton );

	}

	updateRoadSegments () {
	}

	removeRoadSegment ( segment: SplineSegment ) {

		this.splineSegments = this.splineSegments.filter( i => i != segment );

		this.update();
	}

	removeRoadSegmentByRoadId ( id: number ) {

		this.splineSegments = this.splineSegments.filter( segment => segment.id != id );

		this.update();
	}

	getSplineSegments (): SplineSegment[] {

		return this.splineSegments;

	}

	addControlPointAt ( position: Vector3 ): AbstractControlPoint {

		throw new Error( 'Method not implemented.' );

	}

	getCoordAt ( point: Vector3 ): TvPosTheta {

		let minDistance = Number.MAX_SAFE_INTEGER;

		const coordinates = new TvPosTheta();

		for ( const geometry of this.exportGeometries() ) {

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

	getFirstRoadSegment () {

		const segments = this.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( segment.isRoad ) {

				return segment;

			}

		}

	}

	getRoads (): TvRoad[] {

		return this.getSplineSegments().filter( i => i.isRoad ).map( i => i.getInstance<TvRoad>() );

	}

	getJunctionSegments (): SplineSegment[] {

		return this.getSplineSegments().filter( i => i.isJunction );

	}

	getJunctions (): TvJunction[] {

		return this.getJunctionSegments().map( i => i.getInstance<TvJunction>() );

	}

	getPreviousSegment ( segment: TvRoad | TvJunction ): SplineSegment {

		const index = this.splineSegments.findIndex( i => i.segment == segment );

		if ( index == -1 ) return null;

		return this.splineSegments[ index - 1 ];

	}

	getNextSegment ( segment: TvRoad | TvJunction ): SplineSegment {

		const index = this.splineSegments.findIndex( i => i.segment == segment );

		if ( index == -1 ) return null;

		if ( index == this.splineSegments.length - 1 ) return null;

		return this.splineSegments[ index + 1 ];

	}

	getSegmentAt ( s: number ): SplineSegment {

		const segments = this.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			const end = i + 1 < segments.length ? segments[ i + 1 ].start : Number.MAX_VALUE;

			if ( s >= segment.start && s < end ) return segment;

		}

	}

	findSegment ( segment: TvRoad | TvJunction ): SplineSegment {

		if ( segment instanceof TvRoad ) {

			return this.splineSegments.find( i => i.id == segment.id && i.type == SplineSegmentType.ROAD );

		} else if ( segment instanceof TvJunction ) {

			return this.splineSegments.find( i => i.id == segment.id && i.type == SplineSegmentType.JUNCTION );

		} else {

			return null;
		}

	}

	removeSegment ( segment: TvRoad | TvJunction ): void {

		const index = this.splineSegments.findIndex( i => i.segment == segment );

		if ( index != -1 ) {

			this.splineSegments.splice( index, 1 );

			this.update();

		} else {

			console.error( 'segment not found', segment );

		}

	}

	insertPoint ( newPoint: AbstractControlPoint ): void {

		let minDistance = Infinity;
		let index = this.controlPoints.length; // insert at the end by default

		for ( let i = 0; i < this.controlPoints.length - 1; i++ ) {

			const pointA = this.controlPoints[ i ];
			const pointB = this.controlPoints[ i + 1 ];

			const distance = this.calculateDistanceToSegment( newPoint, pointA, pointB );

			if ( distance < minDistance ) {

				minDistance = distance;
				index = i + 1;

			}

		}

		this.controlPoints.splice( index, 0, newPoint );

		this.update();

	}

	private calculateDistanceToSegment ( newPoint: AbstractControlPoint, pointA: AbstractControlPoint, pointB: AbstractControlPoint ): number {

		const segmentDirection = pointB.position.clone().sub( pointA.position ).normalize();

		const segmentStartToPoint = newPoint.position.clone().sub( pointA.position );

		const projection = segmentStartToPoint.clone().dot( segmentDirection );

		if ( projection < 0 ) {

			return newPoint.position.distanceTo( pointA.position );

		} else if ( projection > pointA.position.distanceTo( pointB.position ) ) {

			return newPoint.position.distanceTo( pointB.position );

		} else {

			const projectionPoint = segmentDirection.clone().multiplyScalar( projection ).add( pointA.position );

			return newPoint.position.distanceTo( projectionPoint );

		}

	}

}


