/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SpiralUtils } from 'app/utils/spiral-utils';
import { Maths } from '../../../utils/maths';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';
import { Curve, SplineCurve, Vector2 } from 'three';

export class TvSpiralGeometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.SPIRAL;
	public attr_curvStart;
	public attr_curvEnd;

	private sqrtPiO2 = Math.sqrt( Maths.PI2 );
	private mA;
	private mCurvature;
	private mDenormalizeFactor;
	private endX;
	private endY;
	private normalDirection;

	private differenceAngle;
	private mRotCos;
	private mRotSin;

	constructor ( s: number, x: number, y: number, hdg: number, length: number, curvStart: number, curvEnd: number ) {

		super( s, x, y, hdg, length );

		this.attr_curvStart = curvStart;
		this.attr_curvEnd = curvEnd;

	}

	computeVars () {
	}

	/**
	 * Gets the coordinates at the sample S offset
	 * @param s
	 */
	getRoadCoord ( sCheck: number ): TvPosTheta {

		const dist = Maths.clamp( sCheck - this.s, 0.0, this.length );

		const curveEnd = this.attr_curvEnd;
		const curveStart = this.attr_curvStart;
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

		return new TvPosTheta( retX, retY, this.hdg + t, sCheck );
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

	clone (): TvAbstractRoadGeometry {

		return new TvSpiralGeometry( this.s, this.x, this.y, this.hdg, this.length, this.attr_curvStart, this.attr_curvEnd );

	}

}
