/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, SplineCurve, Vector2, Vector3 } from 'three';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export class TvParamPoly3Geometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.PARAMPOLY3;

	private sinTheta;
	private cosTheta;
	private curve: Curve<Vector2>;

	public aU: number;
	public bU: number;
	public cU: number;
	public dU: number;
	public aV: number;
	public bV: number;
	public cV: number;
	public dV: number;

	constructor (
		s: number,
		x: number,
		y: number,
		hdg: number,
		length: number,
		aU: number, bU: number, cU: number, dU: number,
		aV: number, bV: number, cV: number, dV: number
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

		// this.getCurve();
	}

	get v0 () {
		return new Vector2( this.aU, this.aV );
	}

	get v1 () {
		return new Vector2( this.bU, this.bV );
	}

	get v2 () {
		return new Vector2( this.cU, this.cV );
	}

	get v3 () {
		return new Vector2( this.dU, this.dV );
	}

	computeVars () {

		this.sinTheta = Math.sin( this.hdg );
		this.cosTheta = Math.cos( this.hdg );

	}

	getCoords ( sCheck, posTheta: TvPosTheta ) {

		// normalised p between 0 to 1
		const du = sCheck - this.s;
		const p = ( du / this.length );

		const uLocal =
			( this.aU ) +
			( this.bU * p ) +
			( this.cU * p * p ) +
			( this.dU * p * p * p );

		const vLocal =
			( this.aV ) +
			( this.bV * p ) +
			( this.cV * p * p ) +
			( this.dV * p * p * p );

		// apply rotation with respect to start
		const xnew = uLocal * this.cosTheta - vLocal * this.sinTheta;
		const ynew = uLocal * this.sinTheta + vLocal * this.cosTheta;

		// Derivate to get heading change
		const dCoeffsU = ( new Vector3( this.bU, this.cU, this.dU ) ).multiply( new Vector3( 1, 2, 3 ) );
		const dCoeffsV = ( new Vector3( this.bV, this.cV, this.dV ) ).multiply( new Vector3( 1, 2, 3 ) );

		const dx = this.polyeval( p, dCoeffsU );
		const dy = this.polyeval( p, dCoeffsV );

		const tangent = Math.atan2( dy, dx );

		// apply tranformation with respect to start
		posTheta.x = this.x + xnew;
		posTheta.y = this.y + ynew;
		posTheta.hdg = this.hdg + tangent;

		// if ( this.curve != null ) {
		//
		//     const du = sCheck - this.s;
		//
		//     const p = du / this.length;
		//
		//     const point = this.curve.getPointAt( p );
		//
		//     posTheta.x = point.x;
		//     posTheta.y = point.y;
		//
		//     const tangent = this.curve.getTangent( p );
		//
		//     posTheta.hdg = tangent.angle();
		//
		//     return this.geometryType;
		// }
		//
		// return;

		// if ( this.curve != null ) {

		//     const tangent = this.curve.getTangent( p );

		//     posTheta.hdg = tangent.angle();

		// } else {

		//     posTheta.hdg = this.hdg;

		// }

		return this.geometryType;
	}

	getCurve (): Curve<Vector2> {

		// const v0 = this.v0;
		// const v1 = this.v1;
		// const v2 = this.v2;
		// const v3 = this.v3;
		//
		// return new CubicBezierCurve( v0, v1, v2, v3 );

		const resolution = 1;
		const s = this.sinTheta;
		const c = this.cosTheta;
		const pMax = this.length;
		const pStep = pMax / Math.ceil( this.length / resolution );

		const points: Vector2[] = [];

		for ( let p = 0; p <= pMax + pStep; p += pStep ) {

			const x =
				( this.aU ) +
				( this.bU * p ) +
				( this.cU * p * p ) +
				( this.dU * p * p * p );

			const y =
				( this.aV ) +
				( this.bV * p ) +
				( this.cV * p * p ) +
				( this.dV * p * p * p );

			const xnew = x * c - y * s;
			const ynew = x * s + y * c;

			points.push( new Vector2( this.x + xnew, this.y + ynew ) );

		}

		// for ( let sCoordinate = this.s; sCoordinate < this.s2; sCoordinate++ ) {

		//     this.getCoords( sCoordinate, posTheta );
		//     points.push( posTheta.toVector2() );

		// }

		return this.curve = new SplineCurve( points );

	}
}
