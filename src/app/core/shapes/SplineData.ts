/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2, Vector4 } from 'three';

class SplineData {

	public xb: Vector4;

	public yb: Vector4;

	constructor ( p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2 ) {

		this.xb = new Vector4( p0.x, p1.x, p2.x, p3.x );

		this.yb = new Vector4( p0.y, p1.y, p2.y, p3.y );

	}

}

// Optimised for t=0.5
function Split ( spline: Vector4 ) {

	const q0 = ( spline.x + spline.y ) * 0.5; // x + y / 2

	const q1 = ( spline.y + spline.z ) * 0.5; // y + z / 2

	const q2 = ( spline.z + spline.w ) * 0.5; // z + w / 2

	const r0 = ( q0 + q1 ) * 0.5; // x + 2y + z / 4

	const r1 = ( q1 + q2 ) * 0.5; // y + 2z + w / 4

	const s0 = ( r0 + r1 ) * 0.5; // q0 + 2q1 + q2 / 4 = x+y + 2(y+z) + z+w / 8 = x + 3y + 3z + w

	const sx = spline.x; // support aliasing

	const sw = spline.w;

	return [ new Vector4( sx, q0, r0, s0 ), new Vector4( s0, r1, q2, sw ) ];

}

export function HermiteSpline ( p0: Vector2, p1: Vector2, v0: Vector2, v1: Vector2 ): SplineData {

	const pb1 = new Vector2().copy( v0 ).multiplyScalar( 1.0 / 3.0 ).add( p0 );

	const pb2 = new Vector2().copy( v1 ).multiplyScalar( -1.0 / 3.0 ).add( p1 );

	return new SplineData( p0, pb1, pb2, p1 );

}

function sqr ( x ) {
	return x * x;
}

function LengthEstimate ( s: SplineData ) {

	// Our convex hull is p0, p1, p2, p3, so p0_p3 is our minimum possible length, and p0_p1 + p1_p2 + p2_p3 our maximum.

	const d03 = sqr( s.xb.x - s.xb.w ) + sqr( s.yb.x - s.yb.w );

	const d01 = sqr( s.xb.x - s.xb.y ) + sqr( s.yb.x - s.yb.y );

	const d12 = sqr( s.xb.y - s.xb.z ) + sqr( s.yb.y - s.yb.z );

	const d23 = sqr( s.xb.z - s.xb.w ) + sqr( s.yb.z - s.yb.w );

	let minLength = Math.sqrt( d03 );

	let maxLength = Math.sqrt( d01 ) + Math.sqrt( d12 ) + Math.sqrt( d23 );

	minLength *= 0.5;

	maxLength *= 0.5;

	return [ minLength + maxLength, maxLength - minLength ];

}

export function Length ( s: SplineData, maxError /*float*/ ) {

	let length, error;

	[ length, error ] = LengthEstimate( s );

	if ( error > maxError ) {

		const s0 = new SplineData( new Vector2(), new Vector2(), new Vector2(), new Vector2() );

		const s1 = new SplineData( new Vector2(), new Vector2(), new Vector2(), new Vector2() );

		[ s0.xb, s1.xb ] = Split( s.xb );

		[ s0.yb, s1.yb ] = Split( s.yb );

		return Length( s0, maxError ) + Length( s1, maxError );

	}

	return length;

}
