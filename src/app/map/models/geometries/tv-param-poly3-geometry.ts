/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, SplineCurve, Vector2 } from 'three';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

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
		public pRange: 'arcLength' | 'normalized' = 'arcLength'
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

	computeVars () {

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

	getCurve (): Curve<Vector2> {

		// resolution can be increased to 0.001 but 0.01 for now is fine
		// very low value for resolution means high memory for control points
		const resolution = 0.01;
		const sin = this.sinTheta;
		const cos = this.cosTheta;
		const pMax = this.length;
		const numSteps = Math.ceil( this.length / resolution );
		const pStep = this.length / numSteps;

		const points: Vector2[] = [];

		for ( let p = 0; p <= pMax; p += pStep ) {

			const x = this.aU + this.bU * p + this.cU * p * p + this.dU * p * p * p;
			const y = this.aV + this.bV * p + this.cV * p * p + this.dV * p * p * p;

			const xnew = x * cos - y * sin;
			const ynew = x * sin + y * cos;

			const point = new Vector2( this.x + xnew, this.y + ynew );

			points.push( point );

		}

		// NOTE: Dont add last point to avoid bug and issues

		return this.curve = new SplineCurve( points );
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

}
