/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SpiralUtils } from 'app/utils/spiral-utils';
import { Maths } from '../../../utils/maths';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

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

	getCurve (): import( 'three' ).Curve<import( 'three' ).Vector2> {
		throw new Error( 'Method not implemented.' );
	}

	clone (): TvAbstractRoadGeometry {

		return new TvSpiralGeometry( this.s, this.x, this.y, this.hdg, this.length, this.attr_curvStart, this.attr_curvEnd );

	}

}


// old version for reference
// export class OdSpiralGeometry extends OdAbstractRoadGeometry {

//     public attr_curvStart;
//     public attr_curvEnd;

//     private sqrtPiO2 = Math.sqrt( Maths.M_PI_2 );
//     private mA;
//     private mCurvature;
//     private mDenormalizeFactor;
//     private endX;
//     private endY;
//     private normalDirection;

//     private differenceAngle;
//     private mRotCos;
//     private mRotSin;

//     constructor ( s: number, x: number, y: number, hdg: number, length: number, curvStart: number, curvEnd: number ) {

//         super( s, x, y, hdg, length );

//         this.attr_curvStart = curvStart;
//         this.attr_curvEnd = curvEnd;

//         this._geometryType = OdGeometryType.SPIRAL;

//         this.computeVars();
//     }

//     computeVars () {

//         this.mA = 0;

//         // if the curvatureEnd is the non-zero curvature, then the motion is in normal direction along the spiral
//         if ( (Math.abs( this.attr_curvEnd ) > Maths.Epsilon) && (Math.abs( this.attr_curvStart ) <= Maths.Epsilon) ) {

//             this.normalDirection = true;

//             this.mCurvature = this.attr_curvEnd;

//             // Calculate the normalization term :
//             // a = 1.0/sqrt(2*End_Radius*Total_Curve_Length)
//             this.mA = 1.0 / Math.sqrt( 2 * (1.0 / Math.abs( this.mCurvature )) * this.length );

//             this.mDenormalizeFactor = 1.0 / this.mA;

//             // Calculate the sine and cosine of the heading angle used to
//             // rotate the spiral according to the heading
//             this.mRotCos = Math.cos( this.attr_hdg );
//             this.mRotSin = Math.sin( this.attr_hdg );

//         } else {

//             this.normalDirection = false;

//             this.mCurvature = this.attr_curvStart;

//             this.mA = 1.0 / Math.sqrt( 2 * 1.0 / Math.abs( this.mCurvature ) * this.length );

//             // Because we move in the inverse direction, we need to rotate the curve according to the heading
//             // around the last point of the normalized spiral
//             // Calculate the total length, normalize it and divide by sqrtPiO2, then, calculate the position of the final point.

//             const L = (( this._s2 - this.s ) * this.mA) / this.sqrtPiO2;

//             const res = SpiralUtils.fresnel( L, this.endY, this.endX );

//             this.endX = res.x;
//             this.endY = res.y;

//             // Invert the curve if the curvature is negative
//             if ( this.mCurvature < 0 ) {
//                 this.endY = -this.endY;
//             }

//             // Denormalisation factor
//             this.mDenormalizeFactor = 1.0 / this.mA;

//             // Find the x,y coords of the final point fo the curve in local curve coordinates
//             this.endX *= this.mDenormalizeFactor * this.sqrtPiO2;
//             this.endY *= this.mDenormalizeFactor * this.sqrtPiO2;

//             // Calculate the tangent angle
//             this.differenceAngle = L * L * ( this.sqrtPiO2 * this.sqrtPiO2 );

//             let diffAngle;

//             // Calculate the tangent and heading angle difference that will be used to rotate the spiral
//             if ( this.mCurvature < 0 ) {

//                 diffAngle = this.hdg - this.differenceAngle - Math.PI;

//             } else {

//                 diffAngle = this.hdg + this.differenceAngle - Math.PI;

//             }

//             // Calculate the sine and cosine of the different angle
//             this.mRotCos = Math.cos( diffAngle );
//             this.mRotSin = Math.sin( diffAngle );

//         }


//     }

//     /**
//      * Gets the coordinates at the sample S offset
//      * @param sCheck
//      * @param odPosTheta
//      */
//     getCoords ( sCheck, odPosTheta: OdPosTheta ) {

//         let l = 0.0;
//         let tmpX = 0.0, tmpY = 0.0;

//         let retX, retY, retHdg;

//         // Depending on the moving direction, calculate the length of the curve from its beginning to the current point and normalize
//         // it by multiplying with the "a" normalization term
//         // Cephes lib for solving Fresnel Integrals, uses cos/sin (PI/2 * X^2) format in its function.
//         // So, in order to use the function, transform the argument (which is just L) by dividing it
//         // by the sqrt(PI/2) factor and multiply the results by it.
//         if ( this.normalDirection ) {

//             l = (( sCheck - this.s ) * this.mA) / this.sqrtPiO2;

//         } else {

//             l = (( this._s2 - sCheck ) * this.mA) / this.sqrtPiO2;

//         }

//         // Solve the Fresnel Integrals
//         const res = SpiralUtils.fresnel( l, tmpY, tmpX );
//         tmpY = res.y;
//         tmpX = res.x;

//         // If the curvature is negative, invert the curve on the Y axis
//         if ( this.mCurvature < 0 ) {
//             tmpY = -tmpY;
//         }

//         // Denormalize the results and multiply by the sqrt(PI/2) term
//         tmpX *= this.mDenormalizeFactor * this.sqrtPiO2;
//         tmpY *= this.mDenormalizeFactor * this.sqrtPiO2;

//         // Calculate the heading at the found position.
//         // Kill the sqrt(PI/2) term that was added to the L
//         l = ( sCheck - this.s ) * this.mA;

//         let tangentAngle = l * l;

//         if ( this.mCurvature < 0 ) {
//             tangentAngle = -tangentAngle;
//         }

//         retHdg = this.hdg + tangentAngle;


//         if ( !this.normalDirection ) {

//             // If we move in the inverse direction, translate the spiral
//             // in order to rotate around its final point
//             tmpX -= this.endX;
//             tmpY -= this.endY;

//             // also invert the spiral in the y-axis
//             tmpY = -tmpY;
//         }

//         // Translate the curve to the required position & rotate it
//         retX = this.x + tmpX * this.mRotCos - tmpY * this.mRotSin;
//         retY = this.y + tmpY * this.mRotCos + tmpX * this.mRotSin;


//         odPosTheta.x = retX;
//         odPosTheta.y = retY;
//         odPosTheta.hdg = retHdg;

//         return this.geometryType;
//     }

//     getCurve (): import( "three" ).Curve<import( "three" ).Vector2> {
//         throw new Error( "Method not implemented." );
//     }

// }
