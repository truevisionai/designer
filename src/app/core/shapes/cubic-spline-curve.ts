/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { CatmullRomCurve3, Curve, CurvePath, CurveType, Vector3 } from 'three';
import { AutoSpline } from './auto-spline';
import { ExplicitSpline } from './explicit-spline';


function CubicBezierP0 ( t, p ) {

	const k = 1 - t;
	return k * k * k * p;

}

function CubicBezierP1 ( t, p ) {

	const k = 1 - t;
	return 3 * k * k * t * p;

}

function CubicBezierP2 ( t, p ) {

	return 3 * ( 1 - t ) * t * t * p;

}

function CubicBezierP3 ( t, p ) {

	return t * t * t * p;

}

function CubicBezier ( t, p0, p1, p2, p3 ) {

	return CubicBezierP0( t, p0 ) + CubicBezierP1( t, p1 ) + CubicBezierP2( t, p2 ) +
		CubicBezierP3( t, p3 );

}

export class CubicSplineCurve extends Curve<Vector3> {

	constructor (
		public points: Vector3[] = [],
		public closed?: boolean,
		public curveType?: string,
		public tension?: number
	) {
		super();
	}

	getPoint ( t: number, optionalTarget?: Vector3 ): Vector3 {

		const point = optionalTarget || new Vector3();

		const points = this.points;
		const p = ( points.length - 1 ) * t;

		const intPoint = Math.floor( p );
		const weight = p - intPoint;

		const p0 = points[ intPoint === 0 ? intPoint : intPoint - 1 ];
		const p1 = points[ intPoint ];
		const p2 = points[ intPoint > points.length - 2 ? points.length - 1 : intPoint + 1 ];
		const p3 = points[ intPoint > points.length - 3 ? points.length - 1 : intPoint + 2 ];

		point.set(
			CubicBezier( weight, p0.x, p1.x, p2.x, p3.x ),
			CubicBezier( weight, p0.y, p1.y, p2.y, p3.y ),
			CubicBezier( weight, p0.z, p1.z, p2.z, p3.z ),
		);

		return point;
	}


}

export class HermiteSplineCurve extends CurvePath<Vector3> {

	constructor (
		public v0: Vector3, public v1: Vector3, public v2: Vector3, public v3: Vector3
	) {
		super();
	}

	getPoint ( t: number, optionalTarget?: Vector3 ): Vector3 {

		const point = optionalTarget || new Vector3();

		const p1 = this.v0;
		const p2 = this.v3;
		const t1 = new Vector3().subVectors( this.v1, this.v0 ).multiplyScalar( 3.5 );
		const t2 = new Vector3().subVectors( this.v3, this.v2 ).multiplyScalar( 3.5 );

		const s = t, s2 = s * s, s3 = s2 * s;
		const h1 = new Vector3().setScalar( 2 * s3 - 3 * s2 + 1 ).multiply( p1 );
		const h2 = new Vector3().setScalar( -2 * s3 + 3 * s2 ).multiply( p2 );
		const h3 = new Vector3().setScalar( s3 - 2 * s2 + s ).multiply( t1 );
		const h4 = new Vector3().setScalar( s3 - s2 ).multiply( t2 );

		point.copy( h1 ).add( h2 ).add( h3 ).add( h4 );

		return point;
	}

	getCoefficients () {


	}

}

export class LineArcSplineCurve extends CurvePath<Vector3> {

	public radiuses: number[];

	/** NOT WORKING CURRENTLY */
	constructor (
		public points: AnyControlPoint[]
	) {
		super();
	}

	getPoint ( t: number, optionalTarget?: Vector3 ): Vector3 {

		this.calcRadius();

		const point = optionalTarget || new Vector3();

		const ARC_TESSEL_HALF = 24 / 2;

		let vertexIndex = 0;
		let currentPoint = null;
		let prevPoint = null;
		let nextPoint = null;
		let radius = null;

		const i = 1;

		currentPoint = this.points[ i ];

		radius = this.radiuses[ i ];

		if ( radius == 0 ) {

			point.copy( currentPoint );

		} else {

			prevPoint = this.points[ i - 1 ].position;
			nextPoint = this.points[ i + 1 ].position;

			const p1 = new Vector3()
				.subVectors( prevPoint, currentPoint )
				.normalize()
				.multiplyScalar( radius )
				.add( currentPoint );

			const p0 = currentPoint;

			const p2 = new Vector3()
				.subVectors( nextPoint, currentPoint )
				.normalize()
				.multiplyScalar( radius )
				.add( currentPoint );


			// for ( let ii = 0; ii < ARC_TESSEL_HALF; ii++ ) {

			//     pos.lerpVectors( p1, p0, ii / ARC_TESSEL_HALF );

			//     pos.copy( this.arcInterpolation( currentPoint, prevPoint, nextPoint, radius, pos ) );

			// }

			// for ( let ii = 0; ii < ARC_TESSEL_HALF; ii++ ) {

			//     pos.lerpVectors( p0, p2, ii / ARC_TESSEL_HALF );

			//     pos.copy( this.arcInterpolation( currentPoint, prevPoint, nextPoint, radius, pos ) );

			// }

			point.lerpVectors( p1, p0, t );

			point.copy( this.arcInterpolation( currentPoint, prevPoint, nextPoint, radius, point ) );

			point.lerpVectors( p0, p2, t );

			point.copy( this.arcInterpolation( currentPoint, prevPoint, nextPoint, radius, point ) );


		}

		return point;
	}

	calcRadius (): void {

		if ( this.points.length === 0 ) return;

		// init all radiuses to Infinity
		this.radiuses = new Array( this.points.length );

		// store lengths from one point to another for the whole spline
		const lengths = new Array( this.points.length - 1 );

		let currentPoint: AnyControlPoint = null;
		let nextPoint: AnyControlPoint = null;

		this.points.forEach( ( currentPoint, i ) => {

			// set the radius at each point 0 by default
			this.radiuses[ i ] = 0;

			// set the lengths until the last point
			if ( i < this.points.length - 1 ) {

				nextPoint = this.points[ i + 1 ];

				lengths[ i ] = currentPoint.position.distanceTo( nextPoint.position );
			}

		} );

		// foreach point except the first one
		for ( let i = 1; i < this.points.length - 1; i++ ) {

			this.radiuses[ i ] = Math.min( lengths[ i - 1 ], lengths[ i ] );

		}

		for ( let updated = true; updated; ) {

			updated = false;

			for ( let i = 1; i < this.points.length - 1; i++ ) {

				const leftR = this.radiuses[ i - 1 ] + this.radiuses[ i ] > lengths[ i - 1 ] ? lengths[ i - 1 ] / 2 : this.radiuses[ i ];

				const rightR = this.radiuses[ i + 1 ] + this.radiuses[ i ] > lengths[ i ] ? lengths[ i ] / 2 : this.radiuses[ i ];

				const minR = Math.min( leftR, rightR );

				if ( minR != this.radiuses[ i ] ) {
					updated = true;
					this.radiuses[ i ] = minR;
				}
			}
		}
	}

	arcInterpolation ( currentPoint: Vector3, prevPoint: Vector3, nextPoint: Vector3, radius: number, v: Vector3 ) {

		const va = new Vector3()
			.subVectors( prevPoint, currentPoint )
			.normalize()
			.multiplyScalar( radius );

		const vb = new Vector3()
			.subVectors( nextPoint, currentPoint )
			.normalize()
			.multiplyScalar( radius );

		// const t = ( va.x * va.x + va.y * va.y + va.z * va.z ) / ( va.x * va.x + va.y * va.y + va.z * va.z + vb.x * va.x + vb.y * va.y + vb.z * va.z );
		const t = ( va.x * va.x + va.z * va.z + va.y * va.y )
			/ ( va.x * va.x + va.z * va.z + va.y * va.y + vb.x * va.x + vb.z * va.z + vb.y * va.y );

		// center of circle
		const p = new Vector3().addVectors( va, vb ).multiplyScalar( t ).add( currentPoint );

		// radius of circle
		const r = new Vector3().addVectors( currentPoint, va ).distanceTo( p );

		// project to circle
		return new Vector3().subVectors( v, p ).normalize().multiplyScalar( r ).add( p );
	}
}

export class CatmullRomPath extends CurvePath<Vector3> {

	private catmull: CatmullRomCurve3;

	constructor (
		public points: Vector3[] = [],
		public closed?: boolean,
		public curveType?: CurveType,
		public tension?: number
	) {

		super();

		this.catmull = new CatmullRomCurve3( points, closed, curveType, tension );
	}

	getPoint ( t: number, optionalTarget?: Vector3 ): Vector3 {

		return this.catmull.getPoint( t );

	}

	getLength () {

		return this.catmull.getLength();

	}
}

export class ExplicitSplinePath extends CurvePath<Vector3> {

	constructor (
		private spline: ExplicitSpline,
		private offset: number = 0,
	) {

		super();
	}

	getPoint ( t: number, optionalTarget?: Vector3 ): Vector3 {

		return this.spline.getPoint( t, this.offset );

	}

	getLength () {

		return this.spline.getLength();

	}
}

export class AutoSplinePath extends CurvePath<Vector3> {

	constructor (
		private spline: AutoSpline,
		private offset: number = 0,
	) {

		super();
	}

	getPoint ( t: number, optionalTarget?: Vector3 ): Vector3 {

		return this.spline.getPoint( t, this.offset );

	}

	getLength () {

		return this.spline.getLength();

	}
}
