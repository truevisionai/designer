/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, SplineCurve, Vector2, Vector3 } from 'three';
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
	private sinTheta;
	private cosTheta;
	private curve: Curve<Vector2>;

	constructor (
		s: number,
		x: number,
		y: number,
		hdg: number,
		length: number,
		aU: number, bU: number, cU: number, dU: number,
		aV: number, bV: number, cV: number, dV: number,
		private pRange: 'arcLength' | 'normalized' = 'arcLength'
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

	getPoint ( t: number ): THREE.Vector3 {

		// Function to convert road coordinates to global coordinates
		function roadToGlobal ( s: number, hdg: number, x: number, y: number, u: number, v: number ): THREE.Vector3 {
			// Apply the rotation and translation to convert from road to global coordinates
			const globalX = x + u * Math.cos( hdg ) - v * Math.sin( hdg );
			const globalY = y + u * Math.sin( hdg ) + v * Math.cos( hdg );
			return new Vector3( globalX, globalY, 0 );  // Assume Z = 0 for a 2D road
		}

		let u: number;
		let v: number;

		// Calculate U and V from the cubic polynomial depending on pRange
		if ( this.pRange === 'arcLength' ) {
			u = t * this.length;
			v = this.aV + this.bV * t + this.cV * t * t + this.dV * t * t * t;
		} else if ( this.pRange === 'normalized' ) {
			u = this.aU + this.bU * t + this.cU * t * t + this.dU * t * t * t;
			v = this.aV + this.bV * t + this.cV * t * t + this.dV * t * t * t;
		}

		// Convert from road coordinates to global coordinates
		return roadToGlobal( this.s, this.hdg, this.x, this.y, u, v );
	}

	getHdg ( t: number ): number {

		// Calculate the derivative dv/dt from the cubic polynomial
		const dv_dt = this.bV + 2 * this.cV * t + 3 * this.dV * t * t;

		// Calculate the heading angle using atan2
		let hdg_t = Math.atan2( dv_dt, this.length );

		// Add the initial road segment heading
		hdg_t += this.hdg;

		return hdg_t;
	}


	getRoadCoord ( s: number ): TvPosTheta {

		const t = s / this.length;
		const pos = this.getPoint( t );
		const hdg_t = this.getHdg( t );

		return new TvPosTheta( pos.x, pos.y, hdg_t, s );


		// // Calculate U and V from the cubic polynomial
		// const u = s;
		// const v = this.aV + this.bV * s + this.cV * s * s + this.dV * s * s * s;

		// // Convert from road coordinates to global coordinates
		// const pos = roadToGlobal( this.s, this.hdg, this.x, this.y, u, v );

		// return new TvPosTheta( pos.x, pos.y, this.hdg );

		// return;

		// // normalised p between 0 to 1
		// const du = s - this.s;
		// const p = ( du / this.length );

		// const uLocal =
		// 	( this.aU ) +
		// 	( this.bU * p ) +
		// 	( this.cU * p * p ) +
		// 	( this.dU * p * p * p );

		// const vLocal =
		// 	( this.aV ) +
		// 	( this.bV * p ) +
		// 	( this.cV * p * p ) +
		// 	( this.dV * p * p * p );

		// // apply rotation with respect to start
		// const xnew = uLocal * this.cosTheta - vLocal * this.sinTheta;
		// const ynew = uLocal * this.sinTheta + vLocal * this.cosTheta;

		// // Derivate to get heading change
		// const dCoeffsU = ( new Vector3( this.bU, this.cU, this.dU ) ).multiply( new Vector3( 1, 2, 3 ) );
		// const dCoeffsV = ( new Vector3( this.bV, this.cV, this.dV ) ).multiply( new Vector3( 1, 2, 3 ) );

		// const dx = this.polyeval( p, dCoeffsU );
		// const dy = this.polyeval( p, dCoeffsV );

		// const tangent = Math.atan2( dy, dx );

		// return new TvPosTheta( this.x + xnew, this.y + ynew, this.hdg + tangent );

		// // if ( this.curve != null ) {
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

		// return this.geometryType;
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
