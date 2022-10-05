/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneSide, TvSide } from 'app/modules/tv-map/models/tv-common';
import { Vector2, Vector3 } from 'three';

export class Maths {

	/**
	 *
	 */
	public static readonly M_PI = 3.1415926535;

	/**
	 *
	 */
	public static readonly M_PI_2 = 1.5707963267948966;

	/**
	 * Degrees-to-radians conversion constant (Read Only).
	 */
	public static readonly Deg2Rad = 0.0174532924;

	/**
	 * Radians-to-degrees conversion constant (Read Only).
	 */
	public static readonly Rad2Deg = 57.29578;

	/**
	 * Speed to Kilometer per hour
	 */
	public static readonly Speed2KPH = 0.27777777777;

	/**
	 * Speed to Miles per hour
	 */
	public static readonly Speed2MPH = 0.44702726866;

	/**
	 * A very small positive value
	 */
	public static readonly Epsilon = 0.00000000001;

	public static sinHdgPlusPiO2 ( laneSide: TvLaneSide, hdg: number ): number {

		if ( laneSide == TvLaneSide.LEFT ) {
			return Math.sin( hdg + Maths.M_PI_2 );
		}

		return -Math.sin( hdg + Maths.M_PI_2 );
	}

	public static cosHdgPlusPiO2 ( laneSide: TvLaneSide, hdg: number ): number {

		if ( laneSide == TvLaneSide.LEFT ) {
			return Math.cos( hdg + Maths.M_PI_2 );
		}

		return -Math.cos( hdg + Maths.M_PI_2 );
	}

	public static areaOfTriangle ( A: Vector3, B: Vector3, C: Vector3 ): number {

		// https://www.mathopenref.com/coordtrianglearea.html
		const area = 0.5 * ( ( A.x * ( B.y - C.y ) ) + ( B.x * ( C.y - A.y ) ) + ( C.x * ( A.y - B.y ) ) );

		return Math.abs( area );
	}

	static heightOfTriangle ( A: Vector3, B: Vector3, C: Vector3 ): number {

		const area = this.areaOfTriangle( A, B, C );

		const base = A.distanceTo( C );

		const height = ( 2 * area ) / base;

		return height;
	}

	static findSide ( point: Vector3, rayOrigin: Vector3, rayHdg: number ): TvSide {

		// find the end of the chord line
		const x = rayOrigin.x + Math.cos( rayHdg ) * 100;
		const y = rayOrigin.y + Math.sin( rayHdg ) * 100;
		const z = 0;

		const rayEnd = new Vector3( x, y, z );

		return this.direction( rayOrigin, rayEnd, point );
	}

	public static direction ( start: Vector3, end: Vector3, point: Vector3 ): TvSide {

		const a = start.clone();
		const b = end.clone();
		const c = point.clone();

		// var dot = a.x * b.x + a.y * b.y;
		// if ( dot > 0 )
		//     console.log( '<90 degrees' );
		// else if ( dot < 0 )
		//     console.log( '>90 degrees' );
		// else
		//     console.log( '90 degrees' );

		// subtracting co-ordinates of point A from
		// B and P, to make A as origin
		b.x -= a.x;
		b.y -= a.y;
		c.x -= a.x;
		c.y -= a.y;

		// Determining cross Product
		let cross_product = b.x * c.y - b.y * c.x;

		// return RIGHT if cross product is positive
		if ( cross_product > 0 ) {
			return TvSide.LEFT;
		}// return LEFT if cross product is negative
		else if ( cross_product < 0 ) {
			return TvSide.RIGHT;
		} else {
			console.error( 'unknown side' );
		}

		// return ZERO if cross product is zero.
		// return ZERO;
	}

	static linearInterpolation ( x: number, y: number, t: number ) {

		return ( 1 - t ) * x + t * y;

	}

	static linearInterpolationVector3 ( p1: Vector3, p2: Vector3, t: number ) {

		const a = new Vector3();

		a.x = this.linearInterpolation( p1.x, p2.x, t );
		a.y = this.linearInterpolation( p1.y, p2.y, t );
		a.z = this.linearInterpolation( p1.z, p2.z, t );

		return a;
	}

	public static cosineInterpolation ( x, y, t ) {

		const t2 = ( 1 - Math.cos( t * Math.PI ) ) * 0.5;

		return ( x * ( 1 - t2 ) + y * t2 );
	}

	public static sineInterpolation ( x, y, t ) {

		const t2 = ( 1 - Math.cos( t * Math.PI ) ) * 0.5;

		return ( x * ( 1 - t2 ) + y * t2 );
	}

	public static randomNumberBetween ( min: number, max: number ) {

		return Math.floor( Math.random() * ( max - min + 1 ) + min );

	}

	public static randomFloatBetween ( min: number, max: number ) {

		return Math.random() * ( max - min ) + min;

	}

	public static randomNumberBetweenExcept ( min: number, max: number, numbersToAvoid: number[] ): number {

		let found = false;

		let tries = 0;

		while ( !found ) {

			tries++;

			if ( tries > 3 ) break;

			const randomNumber = this.randomNumberBetween( min, max );

			const used = numbersToAvoid.includes( randomNumber, 0 );

			if ( !used ) {

				found = true;

				return randomNumber;

			}

		}

		return null;
	}

	public static randomFloat () {

		return Math.random();
	}

	static cubicInterpolation ( x: number, y: number, t: any ) {

		return y;

	}

	static moveTowards ( v1: Vector3, v2: Vector3, maxDistanceDelta: number ) {

		const current = v1.clone();
		const target = v2.clone();

		const normalised = target.sub( current ).normalize();

		return current.add( normalised.multiplyScalar( maxDistanceDelta ) );

	}

	static angle ( p1: Vector3, p2: Vector3, p3: Vector3 ): number {

		const v1 = p1.clone();
		const v2 = p2.clone();
		const v3 = p3.clone();

		const a = v1.clone().sub( v2 );
		const b = v1.clone().sub( v3 );

		const dot = a.dot( b );

		const mA = a.length();
		const mB = b.length();

		return Math.acos( ( dot / ( mA * mB ) ) );

		// return Math.atan2( p3.y - p1.y, p3.x - p1.x ) - Math.atan2( p2.y - p1.y, p2.x - p1.x );

	}

	/**
	 * Check intersection between 2 line segments
	 *
	 * @param p1
	 * @param q1
	 * @param p2
	 * @param q2
	 * @returns boolean
	 */
	static doLineSegmentIntersect ( p1: Vector3, q1: Vector3, p2: Vector3, q2: Vector3 ): boolean {

		// Find the four orientations needed for general and
		// special cases
		let o1 = this.orientation( p1, q1, p2 );
		let o2 = this.orientation( p1, q1, q2 );
		let o3 = this.orientation( p2, q2, p1 );
		let o4 = this.orientation( p2, q2, q1 );

		// General case
		if ( o1 != o2 && o3 != o4 ) {
			return true;
		}

		// Special Cases
		// p1, q1 and p2 are colinear and p2 lies on segment p1q1
		if ( o1 == 0 && this.onSegment( p1, p2, q1 ) ) return true;

		// p1, q1 and q2 are colinear and q2 lies on segment p1q1
		if ( o2 == 0 && this.onSegment( p1, q2, q1 ) ) return true;

		// p2, q2 and p1 are colinear and p1 lies on segment p2q2
		if ( o3 == 0 && this.onSegment( p2, p1, q2 ) ) return true;

		// p2, q2 and q1 are colinear and q1 lies on segment p2q2
		if ( o4 == 0 && this.onSegment( p2, q1, q2 ) ) return true;

		return false;
	}

	static onSegment ( p: Vector3, q: Vector3, r: Vector3 ) {

		if (
			q.x <= Math.max( p.x, r.x ) &&
			q.x >= Math.min( p.x, r.x ) &&
			q.y <= Math.max( p.y, r.y ) &&
			q.y >= Math.min( p.y, r.y )
		) {
			return true;
		}

		return false;
	}

	// To find orientation of ordered triplet (p, q, r).
	// The function returns following values
	// 0 --> p, q and r are colinear
	// 1 --> Clockwise
	// 2 --> Counterclockwise
	static orientation ( p: Vector3, q: Vector3, r: Vector3 ) {

		// See https://www.geeksforgeeks.org/orientation-3-ordered-points/
		// for details of below formula.
		let val = ( q.y - p.y ) * ( r.x - q.x ) -
			( q.x - p.x ) * ( r.y - q.y );

		if ( val == 0 ) return 0;  // colinear

		return ( val > 0 ) ? 1 : 2; // clock or counterclock wise
	}

	/**
	 * Get point of intersection of two line segments AB with CD
	 * @param A
	 * @param B
	 * @param C
	 * @param D
	 */
	static lineLineIntersection ( A: Vector3, B: Vector3, C: Vector3, D: Vector3 ): Vector3 {

		// Line AB represented as a1x + b1y = c1
		const a1 = B.y - A.y;
		const b1 = A.x - B.x;
		const c1 = a1 * A.x + b1 * A.y;

		// Line CD represented as a2x + b2y = c2
		const a2 = D.y - C.y;
		const b2 = C.x - D.x;
		const c2 = a2 * ( C.x ) + b2 * ( C.y );

		const determinant = a1 * b2 - a2 * b1;

		if ( determinant === 0 ) {
			// The lines are parallel. This is simplified
			// by returning a pair of FLT_MAX
			return new Vector3( Number.MAX_VALUE, Number.MAX_VALUE, 0 );

		}

		const x = ( b2 * c1 - b1 * c2 ) / determinant;
		const y = ( a1 * c2 - a2 * c1 ) / determinant;

		return new Vector3( x, y, 0 );
	}

	/**
	 * Get points of intersection of 2 points with headings
	 * @param p1
	 * @param p1Heading angle in radians
	 * @param p2
	 * @param p2Heading angle in radians
	 */
	static lineLineIntersection_2 ( p1: Vector3, p1Heading: number, p2: Vector3, p2Heading: number ): Vector3 {

		let a = new Vector3(
			p1.x + Math.cos( p1Heading ) * 100,
			p1.y + Math.sin( p1Heading ) * 100,
			0
		);

		let b = new Vector3(
			p2.x + Math.cos( p2Heading ) * 100,
			p2.y + Math.sin( p2Heading ) * 100,
			0
		);

		return this.lineLineIntersection( p1, a, p2, b );
	}

	static findRadius ( p1: Vector3, p1Heading: number, p3: Vector3, p3Heading: number ) {

		const distance = 1;

		const p2 = new Vector3(
			p1.x + Math.cos( p1Heading + Maths.M_PI_2 ) * distance,
			p1.y + Math.sin( p1Heading + Maths.M_PI_2 ) * distance
		);

		const p4 = new Vector3(
			p3.x + Math.cos( p3Heading + Maths.M_PI_2 ) * distance,
			p3.y + Math.sin( p3Heading + Maths.M_PI_2 ) * distance
		);

		const center = Maths.lineLineIntersection( p1, p2, p3, p4 );

		const radius = p1.distanceTo( center );

		// or
		// const radius = p3.distanceTo( center );

		return {
			radius,
			center
		};

	}

	static clamp ( num: number, min: number, max: number ) {

		return num <= min ? min : num >= max ? max : num;

	}

	static approxEquals ( a: number, b: number, precision = 0.00001 ): boolean {

		return Math.abs( a - b ) <= precision;

	}

	static slope ( A: Vector2 | Vector3, B: Vector2 | Vector3 ) {

		return ( B.y - A.y ) / ( B.x - A.x );

	}

	static isPointOnLine ( A: Vector3, B: Vector3, C: Vector3 ): boolean {

		// https://stackoverflow.com/a/17693146

		let AC = A.distanceTo( C ) + B.distanceTo( C );
		let AB = A.distanceTo( B );

		return Maths.approxEquals( AC, AB );

		//
		// OLD LOGIC BELOW NOT WORKING

		// const slope = this.slope( A, B );

		// if ( slope == Infinity ) {

		//     return C.x === B.x &&

		//         A.y <= C.y &&

		//         C.y <= B.y &&

		//         A.y <= B.y;

		// } else {

		//     const on = C.y - A.y == slope * ( C.x - A.x );

		//     const between =

		//         Math.min( A.x, B.x ) <= C.x &&

		//         C.x <= Math.max( A.x, B.x ) &&

		//         Math.min( A.y, B.y ) <= C.y &&

		//         C.y <= Math.max( A.y, B.y );


		//     return on && between;

		// }
	}

	/**
	 *
	 * @param A start of line
	 * @param B end of line
	 * @param C center of arc/circle
	 * @param R radius of arc/circle
	 */
	static getLineArcIntersections ( A: Vector3, B: Vector3, C: Vector3, R: number ): Vector3[] {

		// TODO: need fix, arc theta check is not being done

		// https://revisionmaths.com/advanced-level-maths-revision/pure-maths/geometry/equation-circle
		// https://stackoverflow.com/a/1088058
		// equation of circle with center (a,b) with radius r is
		//
		// (x-a)^2 + (y-b)^2 = r^2
		//

		// line segment
		// const A = new Vector3( 0, 0, 0 );
		// const B = new Vector3( 0, 150, 0 );
		// const slope = Maths.slope( A, B );

		// center of circle
		// const C = new Vector3( 0, 0, 0 );
		// const R = 100;

		const LAB = A.distanceTo( B );

		// direction vector
		const D = B.sub( A ).divideScalar( LAB );
		// const D = new Vector3(
		//     ( B.x - A.x ) / LAB,
		//     ( B.y - A.y ) / LAB,
		//     0
		// );

		// compute the distance between the points A and E, where
		// E is the point of AB closest the circle center (Cx, Cy)
		const t = D.x * ( C.x - A.x ) + D.y * ( C.y - A.y );

		const E = new Vector3(
			t * D.x + A.y,
			t * D.y + A.y,
			0
		);

		const LEC = E.distanceTo( C );

		// line intersects
		if ( LEC < R ) {

			// compute distance from t to circle intersection point
			const dt = Math.sqrt( R * R - LEC * LEC );

			// compute first intersection point
			const F = new Vector3(
				( t - dt ) * D.x + A.x,
				( t - dt ) * D.y + A.y,
				0
			);

			// compute second intersection point
			const G = new Vector3(
				( t + dt ) * D.x + A.x,
				( t + dt ) * D.y + A.y,
				0
			);

			const intersections = [];


			const F_online = Maths.isPointOnLine( A, B, F );

			if ( F_online ) intersections.push( F );

			const G_online = Maths.isPointOnLine( A, B, G );

			if ( G_online ) intersections.push( G );

			return intersections;

			// const isXOnLine = Maths.isPointOnLine( A, B, new Vector3( 0, 10, 0 ) );

		} else if ( Maths.approxEquals( LEC, R ) ) {

			// TODO: Return tanget also in future
			// tangent point to circle is E

			return [];

		} else {

			// line does not intersect
			return [];

		}
	}
}
