/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { Box3, MathUtils, Vector3 } from 'three';
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { OrderedMap } from "../models/ordered-map";

export enum SplineType {
	AUTO = 'auto',
	AUTOV2 = 'autov2',
	EXPLICIT = 'explicit',
	CATMULLROM = 'catmullrom',
}

// newsegment union
export type NewSegment = TvRoad | TvJunction | null;

export abstract class AbstractSpline {

	public abstract type: SplineType;

	public uuid: string;

	public boundingBox: Box3;

	public controlPoints: AbstractControlPoint[] = [];

	public segmentMap = new OrderedMap<NewSegment>();

	public geometries: TvAbstractRoadGeometry[] = [];

	protected constructor ( public closed = true, public tension = 0.5 ) {
		this.uuid = MathUtils.generateUUID();
	}

	get controlPointPositions (): Vector3[] {
		return this.controlPoints.map( point => point.position );
	}

	getFirstPoint (): AbstractControlPoint | null {
		return this.controlPoints.length >= 1 ? this.controlPoints[ 0 ] : null;
	}

	getSecondPoint (): AbstractControlPoint | null {
		return this.controlPoints.length >= 2 ? this.controlPoints[ 1 ] : null;
	}

	getLastPoint (): AbstractControlPoint | null {
		return this.controlPoints.length >= 1 ? this.controlPoints[ this.controlPoints.length - 1 ] : null;
	}

	getSecondLastPoint (): AbstractControlPoint | null {
		return this.controlPoints.length >= 2 ? this.controlPoints[ this.controlPoints.length - 2 ] : null;
	}

	update () {
		// throw new Error( "Method not implemented." );
	}

	getLength (): number {

		let length = 0;

		this.geometries.forEach( geometry => length += geometry.length );

		return length;

	}

	// clone () {

	// 	const spline: AbstractSpline = new ( this.constructor as any )( this.closed, this.tension );

	// 	spline.uuid = this.uuid;

	// 	this.controlPoints.forEach( point => spline.controlPoints.push( point.clone() ) );

	// 	this.segmentMap.forEach( ( segment, s ) => spline.segmentMap.set( s, segment ) );

	// 	spline.type = this.type;

	// 	return spline;

	// }

	// clear () {
	//
	// 	throw new Error( 'Method not implemented.' );
	//
	// }
	// addControlPoint ( point: AbstractControlPoint ) {
	//
	// 	if ( point.tagindex != null && point.tagindex != undefined && !isNaN( point.tagindex ) ) {
	//
	// 		this.controlPoints.splice( point.tagindex, 0, point );
	//
	// 	} else {
	//
	// 		point.tagindex = this.controlPoints.length;
	//
	// 		this.controlPoints.push( point );
	//
	// 	}
	//
	// 	this.updateIndexes();
	// }
	//

	//
	// removeControlPoint ( cp: AbstractControlPoint ) {
	//
	// 	const index = this.controlPoints.findIndex( p => p.id === cp.id );
	//
	// 	this.controlPoints.splice( index, 1 );
	//
	// 	this.updateIndexes();
	//
	// }
	//

	//
	// getPath ( offset: number = 0 ) {
	//
	// 	if ( this.type == SplineType.AUTO || this.type == SplineType.AUTOV2 ) {
	//
	// 		return new AutoSplinePath( this as any, offset );
	//
	// 	} else if ( this.type == 'explicit' ) {
	//
	// 		return new ExplicitSplinePath( this as any, offset );
	//
	// 	} else {
	//
	// 		TvConsole.error( 'Invalid spline type' );
	//
	// 	}
	//
	// }
	//
	// getPoints ( step: number ) {
	//
	// 	const points: Vector3[] = [];
	//
	// 	const length = this.getLength();
	//
	// 	if ( length == 0 ) return [];
	//
	// 	const d = step / length;
	//
	// 	for ( let i = 0; i <= 1; i += d ) {
	//
	// 		points.push( this.getPoint( i, 0 ).toVector3() );
	//
	// 	}
	//
	// 	return points;
	// }
	//
	// // getDirectedPoints ( step: number ) {
	// //
	// // 	const points: TvPosTheta[] = [];
	// //
	// // 	const length = this.getLength();
	// //
	// // 	if ( length == 0 ) return [];
	// //
	// // 	const d = step / length;
	// //
	// // 	for ( let i = 0; i <= 1; i += d ) {
	// //
	// // 		points.push( this.getPoint( i, 0 ) );
	// //
	// // 	}
	// //
	// // 	return points;
	// // }
	//
	// addSegmentSection ( sStart: number, id: number, type: SplineSegmentType, segment: TvRoad | TvJunction ) {
	//
	// 	if ( sStart == null ) return;
	//
	// 	// check if road segment already exists
	// 	if ( this.segmentMap.contains( segment ) ) return;
	//
	// 	if ( this.segmentMap.has( sStart ) ) {
	//
	// 		console.error( 'Segment already exists', segment );
	//
	// 	} else {
	//
	// 		this.segmentMap.set( sStart, segment );
	//
	// 	}
	//
	// }
	//
	// addRoadSegment ( sStart: number, road: TvRoad ) {
	//
	// 	this.addSegmentSection( sStart, road.id, SplineSegmentType.ROAD, road );
	//
	// }
	//
	// addJunctionSegment ( sStart: number, juncton: TvJunction ) {
	//
	// 	this.addSegmentSection( sStart, juncton.id, SplineSegmentType.JUNCTION, juncton );
	//
	// }
	//
	// updateRoadSegments () {
	// }
	//
	// getSplineSegments () {
	//
	// 	return this.segmentMap.toArray();
	//
	// }
	//
	// // getSplineSegmentCount (): number {
	// //
	// // 	return this.segmentMap.size;
	// //
	// // }
	//
	// /**
	//  *
	//  * @param position
	//  * @returns
	//  * @deprecated
	//  */
	// addControlPointAt ( position: Vector3 ): AbstractControlPoint {
	//
	// 	return null;
	//
	// }
	//
	// getCoordAt ( point: Vector3 ): TvPosTheta {
	//
	// 	let minDistance = Number.MAX_SAFE_INTEGER;
	//
	// 	const coordinates = new TvPosTheta();
	//
	// 	for ( const geometry of this.exportGeometries() ) {
	//
	// 		const temp = new TvPosTheta();
	//
	// 		const nearestPoint = geometry.getNearestPointFrom( point.x, point.y, temp );
	//
	// 		const distance = new Vector2( point.x, point.y ).distanceTo( nearestPoint );
	//
	// 		if ( distance < minDistance ) {
	// 			minDistance = distance;
	// 			coordinates.copy( temp );
	// 		}
	// 	}
	//
	// 	return coordinates;
	//
	// }
	//
	// getFirstRoad () {
	//
	// 	const roads = this.getRoads();
	//
	// 	return roads.length > 0 ? roads[ 0 ] : null;
	//
	// }
	//
	// getRoads (): TvRoad[] {
	//
	// 	const roads: TvRoad[] = [];
	//
	// 	this.segmentMap.forEach( segment => {
	//
	// 		if ( segment instanceof TvRoad ) {
	//
	// 			roads.push( segment );
	//
	// 		}
	//
	// 	} );
	//
	// 	return roads;
	// }
	//
	// getJunctions (): TvJunction[] {
	//
	// 	const junctions: TvJunction[] = [];
	//
	// 	this.segmentMap.forEach( segment => {
	//
	// 		if ( segment instanceof TvJunction ) {
	//
	// 			junctions.push( segment );
	//
	// 		}
	//
	// 	} );
	//
	// 	return junctions;
	//
	// }
	//
	// getPreviousSegment ( segment: TvRoad | TvJunction ) {
	//
	// 	return this.segmentMap.getPrevious( segment );
	//
	// }
	//
	// getNextSegment ( segment: TvRoad | TvJunction ) {
	//
	// 	return this.segmentMap.getNext( segment );
	//
	// }
	//
	// getFirstSegment () {
	//
	// 	return this.segmentMap.getFirst();
	//
	// }
	//
	// getLastSegment () {
	//
	// 	return this.segmentMap.getLast();
	//
	// }
	//
	// getSegmentAt ( s: number ) {
	//
	// 	return this.segmentMap.findAt( s );
	//
	// }
	//
	// insertPoint ( newPoint: AbstractControlPoint ): void {
	//
	// 	const index = this.findIndex( newPoint );
	//
	// 	this.controlPoints.splice( index, 0, newPoint );
	//
	// 	this.updateIndexes();
	//
	// }
	//
	//
	// isConnectingRoad () {
	//
	// 	if ( this.segmentMap.size != 1 ) {
	// 		return false;
	// 	}
	//
	// 	const segment = this.segmentMap.values().next().value;
	//
	// 	if ( !( segment instanceof TvRoad ) ) {
	// 		return false;
	// 	}
	//
	// 	return segment.isJunction;
	//
	// }
	//
	// private calculateDistanceToSegment ( newPoint: AbstractControlPoint, pointA: AbstractControlPoint, pointB: AbstractControlPoint ): number {
	//
	// 	const segment = pointB.position.clone().sub( pointA.position ); // Vector representing the segment
	// 	const startToPoint = newPoint.position.clone().sub( pointA.position ); // Vector from start point to newPoint
	//
	// 	const projectionScalar = startToPoint.dot( segment ) / segment.lengthSq(); // Scalar projection
	// 	const projection = segment.clone().multiplyScalar( projectionScalar ); // Vector projection
	//
	// 	if ( projectionScalar < 0 ) {
	//
	// 		return startToPoint.length(); // Closest point is pointA
	//
	// 	} else if ( projectionScalar > 1 ) {
	//
	// 		return newPoint.position.distanceTo( pointB.position ); // Closest point is pointB
	//
	// 	} else {
	//
	// 		const closestPoint = pointA.position.clone().add( projection ); // Closest point on the segment
	// 		return newPoint.position.distanceTo( closestPoint ); // Distance to closest point on the segment
	//
	// 	}
	//
	// }
	//
	// protected updateIndexes () {
	//
	// 	this.controlPoints.forEach( ( point, index ) => point.tagindex = index );
	//
	// }
	//
	// protected findIndex ( newPoint: AbstractControlPoint ) {
	//
	// 	let minDistance = Infinity;
	// 	let index = this.controlPoints.length; // insert at the end by default
	//
	// 	// Ensure the loop includes the segment between the last and first control points
	// 	for ( let i = 0; i < this.controlPoints.length; i++ ) {
	//
	// 		const pointA = this.controlPoints[ i ];
	//
	// 		// Use modulo to wrap around to the first point when reaching the end
	// 		const pointB = this.controlPoints[ ( i + 1 ) % this.controlPoints.length ];
	//
	// 		const distance = this.calculateDistanceToSegment( newPoint, pointA, pointB );
	//
	// 		if ( distance < minDistance ) {
	// 			minDistance = distance;
	// 			index = i + 1;
	// 		}
	//
	// 	}
	//
	// 	// If the closest segment is the last one, adjust the index to be 0 to insert after the last point
	// 	if ( index === this.controlPoints.length ) {
	// 		index = 0;
	// 	}
	//
	// 	return index;
	// }
	//
	// protected calculateHdg ( index: number, position: Vector3 ) {
	//
	// 	const previousPoint = this.controlPoints[ index - 1 ];
	//
	// 	let hdg: number = 0;
	//
	// 	if ( previousPoint ) {
	//
	// 		// hdg from previous point to new point
	// 		hdg = Maths.heading( previousPoint.position, position );
	//
	// 		if ( isNaN( hdg ) ) {
	// 			hdg = SPIRAL.vec2Angle( previousPoint.position.x, previousPoint.position.y );
	// 		}
	//
	// 		if ( isNaN( hdg ) ) {
	// 			hdg = 0;
	// 		}
	//
	// 	}
	//
	// 	return hdg;
	// }
}


