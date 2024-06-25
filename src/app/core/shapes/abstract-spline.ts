/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import * as THREE from 'three';
import { MathUtils, Vector2, Vector3 } from 'three';
import { AutoSplinePath, ExplicitSplinePath } from './cubic-spline-curve';
import { SplineSegment, SplineSegmentType } from './spline-segment';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { Maths } from "../../utils/maths";
import * as SPIRAL from "./spiral-math";
import { TvConsole } from '../utils/console';

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

	protected constructor ( public closed = true, public tension = 0.5 ) {

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


	}

	addControlPoint ( point: AbstractControlPoint ) {

		if ( point.tagindex != null && !isNaN( point.tagindex ) ) {

			this.controlPoints.splice( point.tagindex, 0, point );

		} else {

			point.tagindex = this.controlPoints.length;

			this.controlPoints.push( point );

		}

		this.updateIndexes();
	}

	addControlPoints ( points: AbstractControlPoint[] ): void {

		points.forEach( point => this.addControlPoint( point ) );

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

		// NOTE: updating here before removing to ensure correct indexes, fix for undo/redo
		this.updateIndexes();

		const index = this.controlPoints.findIndex( p => p.id === cp.id );

		if ( index == -1 ) return;

		this.controlPoints.splice( index, 1 );

		this.updateIndexes();

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

	getPath ( offset: number = 0 ) {

		if ( this.type == SplineType.AUTO || this.type == SplineType.AUTOV2 ) {

			return new AutoSplinePath( this as any, offset );

		} else if ( this.type == 'explicit' ) {

			return new ExplicitSplinePath( this as any, offset );

		} else {

			TvConsole.error( 'Invalid spline type' );

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

			console.error( 'Segment already exists', segment );

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

	getSplineSegments (): SplineSegment[] {

		return this.splineSegments;

	}

	getSplineSegmentCount (): number {

		return this.splineSegments.length;

	}

	/**
	 *
	 * @param position
	 * @returns
	 * @deprecated
	 */
	addControlPointAt ( position: Vector3 ): AbstractControlPoint {

		return null;

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

	getFirstSegment () {

		if ( this.segmentCount == 0 ) return null;

		const segments = this.getSplineSegments();

		return segments[ 0 ];

	}

	getLastSegment () {

		if ( this.segmentCount == 0 ) return null;

		const segments = this.getSplineSegments();

		return segments[ segments.length - 1 ];

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

	removeSegment ( segment: SplineSegment ): void {

		const index = this.splineSegments.indexOf( segment );

		if ( index == -1 ) return;

		this.splineSegments.splice( index, 1 );

	}

	insertPoint ( newPoint: AbstractControlPoint ): void {

		const index = this.findIndex( newPoint );

		this.controlPoints.splice( index, 0, newPoint );

		this.updateIndexes();

		this.update();

	}

	getSuccessorSpline (): AbstractSpline {

		const lastSegment = this.getLastSegment();

		if ( !lastSegment ) return;

		if ( !lastSegment.isRoad ) return;

		const road = lastSegment.getInstance<TvRoad>();

		if ( !road.successor ) return;

		if ( !road.successor.isRoad ) return;

		const successorRoad = road.successor.getElement<TvRoad>();

		return successorRoad.spline;

	}

	getPredecessorrSpline (): AbstractSpline {

		const firstSegment = this.getFirstSegment();

		if ( !firstSegment ) return;

		if ( !firstSegment.isRoad ) return;

		const road = firstSegment.getInstance<TvRoad>();

		if ( !road.predecessor ) return;

		if ( !road.predecessor.isRoad ) return;

		const predecessorRoad = road.predecessor.getElement<TvRoad>();

		return predecessorRoad.spline;

	}

	isConnectingRoad () {

		if ( this.splineSegments.length != 1 ) {
			return false;
		}

		const segment = this.splineSegments[ 0 ];

		if ( !segment.isRoad ) {
			return false;
		}

		const road = segment.getInstance<TvRoad>();

		if ( !road.isJunction ) {
			return false;
		}

		return true;
	}

	private calculateDistanceToSegment ( newPoint: AbstractControlPoint, pointA: AbstractControlPoint, pointB: AbstractControlPoint ): number {

		const segment = pointB.position.clone().sub( pointA.position ); // Vector representing the segment
		const startToPoint = newPoint.position.clone().sub( pointA.position ); // Vector from start point to newPoint

		const projectionScalar = startToPoint.dot( segment ) / segment.lengthSq(); // Scalar projection
		const projection = segment.clone().multiplyScalar( projectionScalar ); // Vector projection

		if ( projectionScalar < 0 ) {

			return startToPoint.length(); // Closest point is pointA

		} else if ( projectionScalar > 1 ) {

			return newPoint.position.distanceTo( pointB.position ); // Closest point is pointB

		} else {

			const closestPoint = pointA.position.clone().add( projection ); // Closest point on the segment
			return newPoint.position.distanceTo( closestPoint ); // Distance to closest point on the segment

		}

	}

	protected updateIndexes () {

		this.controlPoints.forEach( ( point, index ) => point.tagindex = index );

	}

	protected findIndex ( newPoint: AbstractControlPoint ) {

		let minDistance = Infinity;
		let index = this.controlPoints.length; // insert at the end by default

		// Ensure the loop includes the segment between the last and first control points
		for ( let i = 0; i < this.controlPoints.length; i++ ) {

			const pointA = this.controlPoints[ i ];

			// Use modulo to wrap around to the first point when reaching the end
			const pointB = this.controlPoints[ ( i + 1 ) % this.controlPoints.length ];

			const distance = this.calculateDistanceToSegment( newPoint, pointA, pointB );

			if ( distance < minDistance ) {
				minDistance = distance;
				index = i + 1;
			}

		}

		// If the closest segment is the last one, adjust the index to be 0 to insert after the last point
		if ( index === this.controlPoints.length ) {
			index = 0;
		}

		return index;
	}

	protected calculateHdg ( index: number, position: Vector3 ) {

		const previousPoint = this.controlPoints[ index - 1 ];

		let hdg: number = 0;

		if ( previousPoint ) {

			// hdg from previous point to new point
			hdg = Maths.heading( previousPoint.position, position );

			if ( isNaN( hdg ) ) {
				hdg = SPIRAL.vec2Angle( previousPoint.position.x, previousPoint.position.y );
			}

			if ( isNaN( hdg ) ) {
				hdg = 0;
			}

		}

		return hdg;
	}
}


