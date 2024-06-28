/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { Vector3 } from 'three';
import { AbstractSpline, SplineType } from './abstract-spline';
// import { ControlPointFactory } from 'app/factories/control-point.factory';
import { AbstractControlPoint } from "../../objects/abstract-control-point";


export class AutoSplineV2 extends AbstractSpline {

	public type: SplineType = SplineType.AUTOV2;

	// public polyline: Polyline;
	// public roundline: RoundLine;

	constructor () {

		super();

	}

	// init () {
	//
	// 	// this.polyline = new Polyline( this.controlPoints );
	// 	// this.roundline = new RoundLine( this.controlPoints );
	//
	// }

	// hide (): void {
	//
	//
	// }

	// update () {
	//
	// 	this.updateHdgs();
	//
	// 	this.polyline.update();
	//
	// 	this.roundline.update();
	//
	// 	this.updateRoadSegments();
	//
	// }


	// addControlPointAt ( position: Vector3 ): AbstractControlPoint {
	//
	// 	// const index = this.controlPoints.length;
	//
	// 	// const lastSegment = this.roadSegments[ this.roadSegments.length - 1 ];
	//
	// 	// const lastRoadId = lastSegment?.roadId;
	//
	// 	// const lastRoad = lastRoadId ? TvMapInstance.models.getRoadById( lastRoadId ) : null;
	//
	// 	const point = ControlPointFactory.createControl( this, position );
	//
	// 	this.controlPoints.push( point );
	//
	// 	return point;
	// }

	// getPoint ( t: number, offset = 0 ): TvPosTheta {
	//
	// 	const geometries = this.geometries;
	//
	// 	const length = geometries.map( g => g.length ).reduce( ( a, b ) => a + b );
	//
	// 	const s = length * t;
	//
	// 	const geometry = geometries.find( g => s >= g.s && s <= g.endS );
	//
	// 	const posTheta = geometry.getRoadCoord( s );
	//
	// 	posTheta.addLateralOffset( offset );
	//
	// 	return posTheta;
	// }

	// getLength () {
	//
	// 	const geometries = this.geometries;
	//
	// 	let length = 0;
	//
	// 	for ( let i = 0; i < geometries.length; i++ ) {
	//
	// 		length += geometries[ i ].length;
	//
	// 	}
	//
	// 	return length;
	// }

	exportGeometries (): TvAbstractRoadGeometry[] {

		if ( this.controlPoints.length < 2 ) return [];

		// let totalLength = 0;
		//
		// const points = this.roundline.points as AbstractControlPoint[];
		//
		// const radiuses = this.roundline.radiuses;
		//
		// const geometries: TvAbstractRoadGeometry[] = [];
		//
		// let s = 0;
		//
		// for ( let i = 1; i < points.length; i++ ) {
		//
		// 	let x: number, y: number, hdg: number, length: number;
		//
		// 	const previousPoint = points[ i - 1 ];
		// 	const currentPoint = points[ i ];
		//
		// 	const previousPointPosition = previousPoint.position;
		// 	const currentPointPosition = currentPoint.position;
		//
		// 	const p1 = new Vector2( previousPointPosition.x, previousPointPosition.y );
		// 	const p2 = new Vector2( currentPointPosition.x, currentPointPosition.y );
		//
		// 	const distance = p1.distanceTo( p2 );
		//
		// 	const currentRadius = radiuses[ i ];
		// 	const previousRadius = radiuses[ i - 1 ];
		//
		// 	// line between p1 and p2
		// 	if ( distance - previousRadius - currentRadius > 0.001 ) {
		//
		// 		[ x, y ] = new Vector2()
		// 			.subVectors( p2, p1 )
		// 			.normalize()
		// 			.multiplyScalar( radiuses[ i - 1 ] )
		// 			.add( p1 )
		// 			.toArray();
		//
		// 		hdg = new Vector2().subVectors( p2, p1 ).angle();
		// 		// hdg = points[ i - 1 ][ 'hdg' ];
		//
		// 		length = distance - previousRadius - currentRadius;
		//
		// 		s = totalLength;
		//
		// 		totalLength += length;
		//
		// 		const lastGeometry = geometries[ geometries.length - 1 ];
		//
		// 		if ( lastGeometry instanceof TvLineGeometry && lastGeometry.hdg == hdg ) {
		//
		// 			lastGeometry.length += length;
		//
		// 		} else {
		//
		// 			geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );
		//
		// 		}
		//
		// 	}
		//
		// 	// arc for p2
		// 	if ( radiuses[ i ] > 0 ) { // first and last point can't have zero radiuses
		//
		// 		const next = points[ i + 1 ].position;
		//
		// 		const dir1 = new Vector2( currentPointPosition.x - previousPointPosition.x, currentPointPosition.y - previousPointPosition.y ).normalize();
		//
		// 		const dir2 = new Vector2( next.x - currentPointPosition.x, next.y - currentPointPosition.y ).normalize();
		//
		// 		const pp1 = new Vector2()
		// 			.subVectors( p1, p2 )
		// 			.normalize()
		// 			.multiplyScalar( radiuses[ i ] )
		// 			.add( p2 );
		//
		// 		const pp2 = new Vector2()
		// 			.subVectors( ( new Vector2( next.x, next.y ) ), p2 )
		// 			.normalize()
		// 			.multiplyScalar( radiuses[ i ] )
		// 			.add( p2 );
		//
		// 		x = pp1.x;
		//
		// 		y = pp1.y;
		//
		// 		hdg = dir1.angle();
		//
		// 		let r: number, alpha: number, sign: number;
		//
		// 		[ r, alpha, length, sign ] = this.getArcParams( pp1, pp2, dir1, dir2 );
		//
		// 		if ( r != Infinity && !isNaN( r ) ) {
		//
		// 			s = totalLength;
		//
		// 			totalLength += length;
		//
		// 			const curvature = ( sign > 0 ? 1 : -1 ) * ( 1 / r ); // sign < for mirror image
		//
		// 			geometries.push( new TvArcGeometry( s, x, y, hdg, length, curvature ) );
		//
		// 		} else {
		//
		// 			s = totalLength;
		//
		// 			length = pp1.distanceTo( pp2 );
		//
		// 			totalLength += length;
		//
		// 			const lastGeometry = geometries[ geometries.length - 1 ];
		//
		// 			if ( lastGeometry instanceof TvLineGeometry && lastGeometry.hdg == hdg ) {
		//
		// 				lastGeometry.length += length;
		//
		// 			} else {
		//
		// 				geometries.push( new TvLineGeometry( s, x, y, hdg, length ) );
		//
		// 			}
		//
		// 			//console.warn( 'radius is infinity' );
		//
		// 		}
		//
		// 	}
		// }
		// return geometries;
	}

}
