/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, SplineCurve, Vector2, Vector3 } from 'three';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export class TvPoly3Geometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.POLY3;

	public attr_a: number;
	public attr_b: number;
	public attr_c: number;
	public attr_d: number;

	private staringPoint;
	private sinTheta;
	private cosTheta;
	private curve: Curve<Vector2>;

	constructor ( s: number, x: number, y: number, hdg: number, length: number, a: number, b: number, c: number, d: number ) {

		super( s, x, y, hdg, length );

		this.attr_a = a;
		this.attr_b = b;
		this.attr_c = c;
		this.attr_d = d;

		this.computeVars();
	}

	getRoadCoord ( s: number ): TvPosTheta {

		// testing code from
		// const t = ( s - this.s ) / this.length

		// const lateralOffset = this.attr_a * t ^ 3 + this.attr_b * t ^ 2 + this.attr_c * t + this.attr_d

		// posTheta.x = this.x + ( s - this.s ) * Math.cos( this.hdg ) - lateralOffset * Math.sin( this.hdg )
		// posTheta.y = this.y + ( s - this.s ) * Math.sin( this.hdg ) + lateralOffset * Math.cos( this.hdg )

		// const tangent = 3 * this.attr_a * t ^ 2 + 2 * this.attr_b * t + this.attr_c;

		// posTheta.hdg = this.hdg + Math.atan( tangent );


		const vLocal = this.getBezierValue( s );

		const x = s;
		const y = vLocal;

		const xnew = x * this.cosTheta - y * this.sinTheta;
		const ynew = x * this.sinTheta + y * this.cosTheta;

		// Derivate to get heading change`
		const dCoeffs = ( new Vector3( this.attr_b, this.attr_c, this.attr_d ) ).multiply( new Vector3( 1, 2, 3 ) );
		const tangent = this.polyeval( s, dCoeffs );

		return new TvPosTheta( this.x + xnew, this.y + ynew, this.hdg + tangent, s );
	}

	getCurve (): Curve<Vector2> {

		const points: Vector2[] = [];
		let posTheta = new TvPosTheta();

		for ( let sCoordinate = this.s; sCoordinate < this.endS; sCoordinate++ ) {

			posTheta = this.getRoadCoord( sCoordinate );
			points.push( posTheta.toVector2() );

		}

		return this.curve = new SplineCurve( points );

	}

	computeVars () {


		this.sinTheta = Math.sin( this.hdg );
		this.cosTheta = Math.cos( this.hdg );


	}

	getBezierValue ( sCheck ): number {

		const du = sCheck - this.s;

		return ( this.attr_a ) +
			( this.attr_b * du ) +
			( this.attr_c * du * du ) +
			( this.attr_d * du * du * du );
	}

	clone (): TvAbstractRoadGeometry {

		return new TvPoly3Geometry( this.s, this.x, this.y, this.hdg, this.length, this.attr_a, this.attr_b, this.attr_c, this.attr_d );

	}

}
