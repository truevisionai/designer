/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, LineCurve, Vector2, Vector3 } from 'three';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export class TvLineGeometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.LINE;

	constructor ( s: number, x: number, y: number, hdg: number, length: number ) {

		super( s, x, y, hdg, length );

	}

	get start (): Vector2 {

		return new Vector2( this.x, this.y );

	}

	get end (): Vector2 {

		return this.getPositionAt( this.endS ).toVector2();

	}

	get endV3 (): Vector3 {

		return this.getPositionAt( this.endS ).toVector3();

	}

	getCurve (): Curve<Vector2> {

		return new LineCurve( this.start, this.end );

	}

	computeVars () {

		/*nothing*/

	}

	clone () {

		/*nothing*/

	}

	getCoords ( s, odPosTheta: TvPosTheta ): TvGeometryType {

		const ds = s - this.s;

		odPosTheta.x = this.x + Math.cos( this.hdg ) * ds;
		odPosTheta.y = this.y + Math.sin( this.hdg ) * ds;

		odPosTheta.hdg = this.hdg;

		return this.geometryType;

	}

	// closestPointToPointParmeter ( point: Vector3 ) {
	//
	//     const _startP = new Vector3();
	//     const _startEnd = new Vector3();
	//
	//     const start = new Vector3( this.start.x, this.start.y, 0 );
	//     const end = new Vector3( this.end.x, this.end.y, 0 );
	//
	//     _startP.subVectors( point, start );
	//     _startEnd.subVectors( end, start );
	//
	//     var startEnd2 = _startEnd.dot( _startEnd );
	//     var startEnd_startP = _startEnd.dot( _startP );
	//
	//     const t = startEnd_startP / startEnd2;
	//
	//     return t;
	// }

	// getNearestPointFrom ( x2: number, y2: number ): Vector2 {
	//
	//     return this.loopToGetNearestPoint( x2, y2 );
	//
	//     // const point = new Vector3( x2, y2, 0 );
	//     //
	//     // const t = this.closestPointToPointParmeter( point );
	//     //
	//     // const start = new Vector3( this.start.x, this.start.y, 0 );
	//     //
	//     // const delta = new Vector3();
	//     //
	//     // const res = delta.multiplyScalar( t ).add( start );
	//     //
	//     // return new Vector2( res.x, res.y );
	// }

	public getNearestPointFrom ( x: number, y: number, posTheta?: TvPosTheta ): Vector2 {

		return super.getNearestPointFrom( x, y, posTheta );

		// const point = new Vector3( x, y, 0 );
		//
		// const start = this.startV3;
		// const end = this.endV3;
		//
		// const vector = new Vector3().subVectors( point, start );
		// const direction = new Vector3().subVectors( end, start ).normalize();
		//
		// const dot = vector.dot( direction );
		// const projection = direction.multiplyScalar( dot );
		//
		// let nearest: Vector3;
		//
		// if ( dot < 0 ) {
		// 	nearest = start.clone();
		// } else if ( dot > direction.length() ) {
		// 	nearest = end.clone();
		// } else {
		// 	nearest = new Vector3().addVectors( start, projection );
		// }
		//
		// if ( posTheta ) {
		//
		// 	posTheta.x = nearest.x;
		// 	posTheta.y = nearest.y;
		// 	posTheta.s = this.s + nearest.distanceTo( start );
		// 	posTheta.hdg = this.hdg;
		// 	posTheta.t = nearest.distanceTo( point );
		//
		// 	// console.log( Maths.direction( start, end, point ) );
		//
		// }


		// // check if the nearest point is within the line segment
		// const distance = nearest.distanceTo( point );
		// if ( distance > line.geometry.parameters.linewidth / 2 ) {
		// 	nearest = null;
		// }

		// console.log( nearest );

		// return new Vector2( nearest.x, nearest.y );

		// old code
		// return this.loopToGetNearestPoint( x, y, posTheta );
	}

	getStCoordinates ( posTheta: TvPosTheta ) {

		const objPosition = new Vector2( posTheta.x, posTheta.y );

		// get nearest point on road from this new point
		const nearestPointOnRoad = this.getNearestPointFrom( objPosition.x, objPosition.y );

		// Debug.log( nearestPointOnRoad );

		// s value is simply the distance from start to the nearestPointOnRoad
		const s = ( new Vector2( this.x, this.y ) ).distanceTo( nearestPointOnRoad );

		// TODO: Find negative t value as well
		// t value is simple the distance from nearPointOnRoad to object position
		const t = nearestPointOnRoad.distanceTo( objPosition );

		posTheta.s = s;
		posTheta.t = t;
		posTheta.hdg = this.hdg;

		return new Vector2( s, t );
	}

	findS ( x, y ) {

		// not working just for reference

		// const s1 = ( x - this.x ) / Math.cos( this.hdg );
		// const s2 = ( y - this.y ) / Math.sin( this.hdg );

		// let s1Valid = false;
		// let s2Valid = false;

		// if ( isNaN( s1 ) || ( s1 >= 0 && s1 <= this.length ) ) {
		//     s1Valid = true;
		// }

		// if ( isNaN( s2 ) || ( s2 >= 0 && s2 <= this.length ) ) {
		//     s2Valid = true;
		// }

		// return [ s1, s2, s1Valid && s2Valid, s1Valid, s2Valid ];
	}

	// /**
	//  *
	//  * @param geometry
	//  * @deprecated not working currently
	//  */
	// public getIntersections ( geometry: TvAbstractRoadGeometry ): Vector3[] {
	//
	// 	// throw new Error( "Method not implemented." );
	//
	// 	if ( geometry instanceof TvLineGeometry ) {
	//
	// 		const x1 = this.x;
	// 		const y1 = this.y;
	// 		const t1 = this.hdg;
	//
	// 		const x2 = geometry.x;
	// 		const y2 = geometry.y;
	// 		const t2 = geometry.hdg;
	//
	// 		const sX = ( x2 - x1 ) / Math.cos( t2 ) - Math.cos( t1 );
	// 		const sY = ( y2 - y1 ) / Math.sin( t2 ) - Math.sin( t1 );
	//
	// 		// const intersection = Maths.lineLineIntersection( this.startV3, this.endV3, geometry.startV3, geometry.endV3 );
	//
	// 		// if ( intersection &&
	// 		//     Maths.isPointOnLine( this.startV3, this.endV3, intersection ) &&
	// 		//     Maths.isPointOnLine( geometry.startV3, geometry.endV3, intersection )
	// 		// ) {
	//
	// 		//     return [ intersection ];
	//
	// 		// }
	//
	// 	} else if ( geometry instanceof TvArcGeometry ) {
	//
	//
	// 		return Maths.getLineArcIntersections( this.startV3, this.endV3, geometry.centre, geometry.radius );
	//
	// 	} else {
	//
	// 		// console.error( "Intersection with ", geometry.geometryType, "not implemented" );
	//
	// 		// throw new Error( "Method not implemented." );
	//
	// 	}
	//
	// 	return [];
	// }

}
