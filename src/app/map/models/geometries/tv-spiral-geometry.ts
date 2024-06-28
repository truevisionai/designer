/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SpiralUtils } from 'app/utils/spiral-utils';
import { Maths } from '../../../utils/maths';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';
import { Curve, MathUtils, SplineCurve, Vector2 } from 'three';

export class TvSpiralGeometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.SPIRAL;
	public curvStart: number;
	public curvEnd: number;

	public curve: Curve<Vector2>;

	constructor ( s: number, x: number, y: number, hdg: number, length: number, curvStart: number, curvEnd: number ) {

		super( s, x, y, hdg, length );

		this.curvStart = curvStart;
		this.curvEnd = curvEnd;

		this.curve = this.getCurve();

	}

	computeVars () {
	}

	/**
	 * Gets the coordinates at the sample S offset
	 * @param sOffset The distance along the road segment
	 */
	getRoadCoord ( sOffset: number ): TvPosTheta {

		const dist = Maths.clamp( sOffset - this.s, 0.0, this.length );

		const curveEnd = this.curvEnd;
		const curveStart = this.curvStart;
		const curveDot = ( curveEnd - curveStart ) / this.length;
		const s_o = curveStart / curveDot;
		const s = s_o + dist;

		const xyt = SpiralUtils.odrSpiral( s, curveDot, 0, 0, 0 );

		const xyt_o = SpiralUtils.odrSpiral( s_o, curveDot, 0, 0, 0 );

		const x = xyt.x - xyt_o.x;
		const y = xyt.y - xyt_o.y;
		const t = xyt.t - xyt_o.t;

		const angle = this.hdg - xyt_o.t;

		// Translate the curve to the required position & rotate it
		const retX = this.x + x * Math.cos( angle ) - y * Math.sin( angle );
		const retY = this.y + y * Math.cos( angle ) + x * Math.sin( angle );

		return new TvPosTheta( retX, retY, this.hdg + t, sOffset );

	}


	getCurve (): Curve<Vector2> {

		const points: Vector2[] = [];

		let posTheta = new TvPosTheta();

		for ( let sCoordinate = this.s; sCoordinate <= this.endS; sCoordinate++ ) {

			posTheta = this.getRoadCoord( sCoordinate );

			points.push( posTheta.toVector2() );

		}

		posTheta = this.getRoadCoord( this.endS - Maths.Epsilon );

		points.push( posTheta.toVector2() );

		return new SplineCurve( points );
	}

	getRoadCoordFromCurve ( s: number ): TvPosTheta {

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

	getCurveV2 () {

		// resolution can be increased to 0.001 but 0.01 for now is fine
		// very low value for resolution means high memory for control points
		const resolution = 0.1;
		const pMax = this.length;
		const numSteps = Math.ceil( this.length / resolution );
		const pStep = this.length / numSteps;
		const points: Vector2[] = [];

		for ( let i = 0; i <= pMax; i += pStep ) {

			const t = i / this.length;

			const curv = MathUtils.lerp( this.curvStart, this.curvEnd, t );

			const x = this.x + t * this.length * Math.cos( this.hdg + t * curv );
			const y = this.y + t * this.length * Math.sin( this.hdg + t * curv );

			points.push( new Vector2( x, y ) );

		}

		return this.curve = new SplineCurve( points );
	}


	clone (): TvAbstractRoadGeometry {

		return new TvSpiralGeometry( this.s, this.x, this.y, this.hdg, this.length, this.curvStart, this.curvEnd );

	}

}
