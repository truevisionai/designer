/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2 } from "three";

class TvCubicBezier {
	controlPoints: Vector2[];

	constructor ( controlPoints: Vector2[] ) {
		if ( controlPoints.length !== 4 ) {
			throw new Error( 'Cubic Bezier curve requires exactly 4 control points.' );
		}
		this.controlPoints = controlPoints;
	}

	get ( t: number ): Vector2 {
		const [ p0, p1, p2, p3 ] = this.controlPoints;
		const oneMinusT = 1 - t;
		const point = new Vector2();

		point.x =
			oneMinusT * oneMinusT * oneMinusT * p0.x +
			3 * t * oneMinusT * oneMinusT * p1.x +
			3 * t * t * oneMinusT * p2.x +
			t * t * t * p3.x;
		point.y =
			oneMinusT * oneMinusT * oneMinusT * p0.y +
			3 * t * oneMinusT * oneMinusT * p1.y +
			3 * t * t * oneMinusT * p2.y +
			t * t * t * p3.y;

		return point;
	}

	getGrad ( t: number ): Vector2 {
		const [ p0, p1, p2, p3 ] = this.controlPoints;
		const oneMinusT = 1 - t;
		const grad = new Vector2();

		grad.x =
			3 * oneMinusT * oneMinusT * ( p1.x - p0.x ) +
			6 * oneMinusT * t * ( p2.x - p1.x ) +
			3 * t * t * ( p3.x - p2.x );
		grad.y =
			3 * oneMinusT * oneMinusT * ( p1.y - p0.y ) +
			6 * oneMinusT * t * ( p2.y - p1.y ) +
			3 * t * t * ( p3.y - p2.y );

		return grad;
	}

	static getControlPointsFromCoefficients ( coefficients: Vector2[] ): Vector2[] {
		const [ a, b, c, d ] = coefficients;
		const controlPoints = [ a.clone(), new Vector2(), new Vector2(), d.clone() ];

		controlPoints[ 1 ].x = ( b.x / 3 ) + a.x;
		controlPoints[ 1 ].y = ( b.y / 3 ) + a.y;

		controlPoints[ 2 ].x = ( c.x / 3 ) + 2 * controlPoints[ 1 ].x - controlPoints[ 0 ].x;
		controlPoints[ 2 ].y = ( c.y / 3 ) + 2 * controlPoints[ 1 ].y - controlPoints[ 0 ].y;

		controlPoints[ 3 ].x = d.x + 3 * controlPoints[ 2 ].x - 3 * controlPoints[ 1 ].x + controlPoints[ 0 ].x;
		controlPoints[ 3 ].y = d.y + 3 * controlPoints[ 2 ].y - 3 * controlPoints[ 1 ].y + controlPoints[ 0 ].y;

		return controlPoints;
	}

	static getCoefficientsFromControlPoints ( controlPoints: Vector2[] ): Vector2[] {
		const [ pA, pB, pC, pD ] = controlPoints;
		const coefficients = [ pA.clone(), new Vector2(), new Vector2(), new Vector2() ];

		coefficients[ 1 ].x = 3 * ( pB.x - pA.x );
		coefficients[ 1 ].y = 3 * ( pB.y - pA.y );

		coefficients[ 2 ].x = 3 * ( pC.x - 2 * pB.x + pA.x );
		coefficients[ 2 ].y = 3 * ( pC.y - 2 * pB.y + pA.y );

		coefficients[ 3 ].x = pD.x - 3 * pC.x + 3 * pB.x - pA.x;
		coefficients[ 3 ].y = pD.y - 3 * pC.y + 3 * pB.y - pA.y;

		return coefficients;
	}

	getSubcurve ( tStart: number, tEnd: number ): Vector2[] {
		const fCubicT123 = (
			t1: number,
			t2: number,
			t3: number,
			ctrlPts: Vector2[]
		): Vector2 => {
			const out = new Vector2();
			for ( let dim = 0; dim < 3; dim++ ) {
				out.setComponent(
					dim,
					( 1 - t3 ) *
					( ( 1 - t2 ) * ( ( 1 - t1 ) * ctrlPts[ 0 ].getComponent( dim ) + t1 * ctrlPts[ 1 ].getComponent( dim ) ) +
						t2 * ( ( 1 - t1 ) * ctrlPts[ 1 ].getComponent( dim ) + t1 * ctrlPts[ 2 ].getComponent( dim ) ) ) +
					t3 *
					( ( 1 - t2 ) * ( ( 1 - t1 ) * ctrlPts[ 1 ].getComponent( dim ) + t1 * ctrlPts[ 2 ].getComponent( dim ) ) +
						t2 * ( ( 1 - t1 ) * ctrlPts[ 2 ].getComponent( dim ) + t1 * ctrlPts[ 3 ].getComponent( dim ) ) )
				);
			}
			return out;
		};

		const ctrlPtsSub = [
			fCubicT123( tStart, tStart, tStart, this.controlPoints ),
			fCubicT123( tStart, tStart, tEnd, this.controlPoints ),
			fCubicT123( tStart, tEnd, tEnd, this.controlPoints ),
			fCubicT123( tEnd, tEnd, tEnd, this.controlPoints ),
		];

		return ctrlPtsSub;
	}

	approximateLinear ( eps: number ): Set<number> {
		const coefficients = TvCubicBezier.getCoefficientsFromControlPoints( this.controlPoints );
		const segSize = Math.pow(
			0.5 * eps / ( ( 1.0 / 54.0 ) * coefficients[ 3 ].length() ),
			1.0 / 3.0
		);

		const segIntervals: Array<[ number, number ]> = [];
		for ( let t = 0; t < 1; t += segSize ) {
			segIntervals.push( [ t, Math.min( t + segSize, 1 ) ] );
		}

		if ( 1 - segIntervals[ segIntervals.length - 1 ][ 1 ] < 1e-6 ) {
			segIntervals[ segIntervals.length - 1 ][ 1 ] = 1;
		} else {
			segIntervals.push( [ segIntervals[ segIntervals.length - 1 ][ 1 ], 1 ] );
		}

		const tVals: number[] = [ 0 ];
		for ( const [ t0, t1 ] of segIntervals ) {
			const cPtsSub = this.getSubcurve( t0, t1 );

			const pBQuad0 = new Vector2();
			const pBQuad1 = new Vector2();
			const pMQuad = new Vector2();

			for ( let dim = 0; dim < 3; dim++ ) {
				pBQuad0.setComponent( dim, ( 1.0 - 0.75 ) * cPtsSub[ 0 ].getComponent( dim ) + 0.75 * cPtsSub[ 1 ].getComponent( dim ) );
				pBQuad1.setComponent( dim, ( 1.0 - 0.75 ) * cPtsSub[ 3 ].getComponent( dim ) + 0.75 * cPtsSub[ 2 ].getComponent( dim ) );
				pMQuad.setComponent( dim, ( 1.0 - 0.5 ) * pBQuad0.getComponent( dim ) + 0.5 * pBQuad1.getComponent( dim ) );
			}

			tVals.push( t0 );
			tVals.push( t1 );
		}

		tVals.push( 1 );

		return new Set( tVals );
	}
}

export { TvCubicBezier };
