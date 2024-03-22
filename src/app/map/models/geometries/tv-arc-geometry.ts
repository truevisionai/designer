/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Curve, SplineCurve, Vector2, Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvGeometryType } from '../tv-common';
import { TvPosTheta } from '../tv-pos-theta';
import { TvAbstractRoadGeometry } from './tv-abstract-road-geometry';

export class TvArcGeometry extends TvAbstractRoadGeometry {

	public geometryType: TvGeometryType = TvGeometryType.ARC;

	public curvature: number;

	private curve: Curve<Vector2>;

	constructor ( s: number, x: number, y: number, hdg: number, length: number, curvature: number ) {

		super( s, x, y, hdg, length );

		this.curvature = curvature == 0 ? Maths.Epsilon : curvature;
	}

	get radius (): number {

		return 1.0 / Math.abs( this.curvature );

	}

	get centre (): Vector3 {

		const clockwise = this.curvature < 0;

		const circleX = this.x - this.radius * Math.cos( this.hdg - Maths.PI2 ) * ( clockwise ? -1 : 1 );
		const circleY = this.y - this.radius * Math.sin( this.hdg - Maths.PI2 ) * ( clockwise ? -1 : 1 );

		return new Vector3( circleX, circleY, 0 );
	}

	get startAngle () {
		return this.hdg;
	}

	get endAngle () {
		return this.hdg + this.angle;
	}

	get angle () {
		return this.length * this.curvature;
	}

	get startV3 (): Vector3 {
		return new Vector3( this.x, this.y, 0 );
	}

	get middleV3 (): Vector3 {

		return this.getRoadCoord( this.s + ( ( this.endS - this.s ) / 2 ) ).toVector3();

	}

	get endV3 (): Vector3 {

		return this.getRoadCoord( this.endS ).toVector3();

	}

	getRoadCoord ( s: number ): TvPosTheta {

		// calculate the first geometry element for the returning geometries
		var ds = s - this.s;
		var curvature = this.curvature;
		var theta = ds * curvature;
		var radius = 1 / Math.abs( this.curvature );
		var rotation = this.hdg - Math.sign( curvature ) * Math.PI / 2;

		const retX = this.x - radius * Math.cos( rotation ) + radius * Math.cos( rotation + theta );
		const retY = this.y - radius * Math.sin( rotation ) + radius * Math.sin( rotation + theta );

		return new TvPosTheta( retX, retY, this.hdg + theta, s );
	}

	computeVars () {

		// nothing

	}

	findS ( x, y ) {

		// not working just for reference

		// // calculate the first geometry element for the returning geometries
		// //  var ds = s - this.s;
		// var curvature = this.curvature;
		// // var theta = ds * curvature;
		// var radius = 1 / Math.abs( this.curvature );
		// var rotation = this.hdg - Math.sign( curvature ) * Math.PI / 2;

		// let c = ( ( x - this.x ) + ( radius * Math.cos( rotation ) ) ) / radius;
		// let a = Math.cos( rotation );
		// let b = Math.sin( rotation );

		// let alphaCos = Math.acos( a / ( Math.sqrt( a * a + b * b ) ) );     // positive
		// let alphaSin = Math.asin( b / ( Math.sqrt( a * a + b * b ) ) );     // negative

		// let thetaCos = Math.asin( c / ( Math.sqrt( a * a + b * b ) ) ) - alphaCos;
		// let thetaSin = Math.asin( c / ( Math.sqrt( a * a + b * b ) ) ) - alphaSin;

		// let thetaNew = Math.asin( c / ( Math.sqrt( a * a + b * b ) ) );

		// let theta = x * this.curvature;

		// let thetaCosCorrect = Maths.approxEquals( theta, thetaCos );
		// let thetaSinCorrect = Maths.approxEquals( theta, thetaSin );
		// let thetaNewCorrect = Maths.approxEquals( theta, thetaNew );

		// let actualS = theta / curvature;
		// let cosS = theta / curvature;
		// let sinS = theta / curvature;
		// let foundS = thetaNew / curvature;

		// let foundSCorrect = Maths.approxEquals( actualS, foundS );

	}

	getCurve (): Curve<Vector2> {

		if ( this.curve != null ) return this.curve;

		const points: Vector2[] = [];
		let posTheta = new TvPosTheta();

		for ( let sCoordinate = this.s; sCoordinate <= this.endS; sCoordinate++ ) {

			posTheta = this.getRoadCoord( sCoordinate );
			points.push( posTheta.toVector2() );

		}

		posTheta = this.getRoadCoord( this.endS - Maths.Epsilon );
		points.push( posTheta.toVector2() );

		return this.curve = new SplineCurve( points );
	}

	clone (): TvAbstractRoadGeometry {

		return new TvArcGeometry( this.s, this.x, this.y, this.hdg, this.length, this.curvature );

	}

}
