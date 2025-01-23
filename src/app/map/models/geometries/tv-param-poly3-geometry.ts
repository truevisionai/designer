/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CubicBezierCurve, Curve, SplineCurve, Vector2 } from "three";
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export type PRANGE = 'arcLength' | 'normalized';

export class TvParamPoly3Geometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.PARAMPOLY3;
	public aU: number;
	public bU: number;
	public cU: number;
	public dU: number;
	public aV: number;
	public bV: number;
	public cV: number;
	public dV: number;
	private sinTheta: number;
	private cosTheta: number;
	private curve: Curve<Vector2>;

	constructor (
		s: number,
		x: number,
		y: number,
		hdg: number,
		length: number,
		aU: number, bU: number, cU: number, dU: number,
		aV: number, bV: number, cV: number, dV: number,
		public pRange: PRANGE = 'arcLength'
	) {
		super( s, x, y, hdg, length );
		this.aU = aU;
		this.bU = bU;
		this.cU = cU;
		this.dU = dU;
		this.aV = aV;
		this.bV = bV;
		this.cV = cV;
		this.dV = dV;

		this.computeVars();

	}

	computeVars (): void {

		this.sinTheta = Math.sin( this.hdg );
		this.cosTheta = Math.cos( this.hdg );
		this.curve = this.getCurve();

	}

	getRoadCoord ( s: number ): TvPosTheta {

		// Calculate the t value from the input road s offset
		const t = ( s - this.s ) / this.length;

		const point = this.curve.getPoint( t )

		// Calculate the derivative (tangent) at parameter t
		const tangent = this.curve.getTangent( t );

		// Calculate the heading using atan2
		const hdg = Math.atan2( tangent.y, tangent.x );

		// Return the position and heading in a TvPosTheta object
		return new TvPosTheta( point.x, point.y, hdg, s );

	}

	getTangent ( t: number, isArcLength: boolean ): Vector2 {

		const u = isArcLength ? t : this.aU + this.bU * t + this.cU * t * t + this.dU * t * t * t;
		const v = isArcLength ? t : this.aV + this.bV * t + this.cV * t * t + this.dV * t * t * t;

		const dx = this.bU + 2 * this.cU * u + 3 * this.dU * u * u;
		const dy = this.bV + 2 * this.cV * v + 3 * this.dV * v * v;

		const xnew = dx * this.cosTheta - dy * this.sinTheta;
		const ynew = dx * this.sinTheta + dy * this.cosTheta;

		return new Vector2( xnew, ynew );
	}

	getCurve (): Curve<Vector2> {

		if ( this.pRange === 'arcLength' ) {

			const points = this.generatePointsArcLength( 0.001 );

			return this.curve = new SplineCurve( points );

		}

		if ( this.pRange == 'normalized' ) {

			const points = this.generatePoints( 0.001 );

			return this.curve = new SplineCurve( points );
		}

	}

	adaptiveSampleArcLength ( p0: number, p1: number, tolerance: number, points: Vector2[] ): void {

		const mid = ( p0 + p1 ) / 2;
		const point0 = this.getPointArcLength( p0 );
		const pointMid = this.getPointArcLength( mid );
		const point1 = this.getPointArcLength( p1 );

		if ( mid == null ) return;
		if ( point0 == null ) return;
		if ( pointMid == null ) return;
		if ( point1 == null ) return;

		const dx = ( point0.x + point1.x ) / 2 - pointMid.x;
		const dy = ( point0.y + point1.y ) / 2 - pointMid.y;
		const distance = Math.sqrt( dx * dx + dy * dy );

		if ( distance > tolerance ) {

			this.adaptiveSampleArcLength( p0, mid, tolerance, points );
			this.adaptiveSampleArcLength( mid, p1, tolerance, points );

		} else {

			points.push( pointMid );

		}
	}

	generatePointsArcLength ( tolerance: number ): Vector2[] {

		const points: Vector2[] = [];

		points.push( this.getPointArcLength( 0 ) );

		this.adaptiveSampleArcLength( 0, this.length, tolerance, points );

		points.push( this.getPointArcLength( this.length ) );

		return points;
	}

	getPointArcLength ( p: number ): Vector2 {

		const x = this.aU + this.bU * p + this.cU * p * p + this.dU * p * p * p;
		const y = this.aV + this.bV * p + this.cV * p * p + this.dV * p * p * p;

		const xnew = x * this.cosTheta - y * this.sinTheta;
		const ynew = x * this.sinTheta + y * this.cosTheta;

		return new Vector2( this.x + xnew, this.y + ynew );
	}

	adaptiveSample ( t0: number, t1: number, tolerance: number, points: Vector2[] ): void {

		const mid = ( t0 + t1 ) / 2;
		const p0 = this.getPoint( t0 );
		const p1 = this.getPoint( mid );
		const p2 = this.getPoint( t1 );

		// Calculate the distance between the midpoint of the segment and the actual curve
		const dx = ( p0.x + p2.x ) / 2 - p1.x;
		const dy = ( p0.y + p2.y ) / 2 - p1.y;
		const distance = Math.sqrt( dx * dx + dy * dy );

		if ( distance > tolerance ) {

			this.adaptiveSample( t0, mid, tolerance, points );
			this.adaptiveSample( mid, t1, tolerance, points );

		} else {

			points.push( p1 );

		}

	}

	generatePoints ( tolerance: number ): Vector2[] {

		const points: Vector2[] = [];

		points.push( this.getPoint( 0 ) );

		this.adaptiveSample( 0, 1, tolerance, points );

		points.push( this.getPoint( 1 ) );

		return points;

	}

	getPoint ( t: number ): Vector2 {

		const x = this.aU + this.bU * t + this.cU * t * t + this.dU * t * t * t;
		const y = this.aV + this.bV * t + this.cV * t * t + this.dV * t * t * t;

		const xnew = x * this.cosTheta - y * this.sinTheta;
		const ynew = x * this.sinTheta + y * this.cosTheta;

		return new Vector2( this.x + xnew, this.y + ynew );

	}

	clone ( s?: number ): TvAbstractRoadGeometry {

		return new TvParamPoly3Geometry(
			s || this.s,
			this.x,
			this.y,
			this.hdg,
			this.length,
			this.aU, this.bU, this.cU, this.dU,
			this.aV, this.bV, this.cV, this.dV,
			this.pRange
		);

	}

	/**
	 * Compute Bezier control points from polynomial coefficients.
	 */
	computeBezierControlPoints (): Vector2[] {

		// Starting point
		const p0 = new Vector2( this.x, this.y );

		const tEnd = this.pRange === 'arcLength' ? this.length : 1;

		// End point (using length as the arc length parameter)
		const p3 = this.getPoint( tEnd );

		// Control points
		const cp1 = new Vector2(
			this.x + this.bU / 3,
			this.y + this.bV / 3
		);
		const cp2 = new Vector2(
			this.x + 2 * this.bU / 3 + this.cU / 3,
			this.y + 2 * this.bV / 3 + this.cV / 3
		);

		return [ p0, cp1, cp2, p3 ];
	}

	/**
	* Create a Three.js Cubic Bezier Curve from polynomial coefficients.
	*/
	createBezierCurve (): CubicBezierCurve {

		const controlPoints = this.computeBezierControlPoints();

		return new CubicBezierCurve(
			controlPoints[ 0 ],
			controlPoints[ 1 ],
			controlPoints[ 2 ],
			controlPoints[ 3 ]
		);

	}

}
