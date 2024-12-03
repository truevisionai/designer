/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { TvArcGeometry } from 'app/map/models/geometries/tv-arc-geometry';
import { TvLineGeometry } from 'app/map/models/geometries/tv-line-geometry';
import { TvSide } from 'app/map/models/tv-common';
import { Maths } from 'app/utils/maths';
import { Curve, Vector3 } from 'three';

export class CustomSplineCurve {

	private mGeometries: TvAbstractRoadGeometry[] = [];

	constructor ( private points: Vector3[] = [] ) {
	}

	get geometries () {
		return this.mGeometries;
	}

	addPoint ( p: Vector3 ): void {

		this.points.push( p );

		this.compute();

	}

	addPoints ( points: Vector3[] ): void {

		points.forEach( point => {
			this.points.push( point );
		} );

		this.compute();
	}

	compute (): void {

		if ( this.points.length < 3 ) return;

		const reversed = [ ...this.points ].reverse();

		for ( let i = 0; i < reversed.length; i++ ) {

			// break if we don't have 3 points remaining
			if ( ( reversed.length - i ) < 3 ) break;

			const p1 = reversed[ i + 2 ];
			const p2 = reversed[ i + 1 ];
			const p3 = reversed[ i ];

			const x = p1.x;
			const y = p1.y;

			const firstSegment = p1.distanceTo( p2 );
			const secondSegment = p2.distanceTo( p3 );

			// hdg of first line segment
			const hdg = Math.atan2( p2.y - p1.y, p2.x - p1.x );

			// hdg of second line segment
			const hdg2 = Math.atan2( p3.y - p2.y, p3.x - p2.x );

			let arcStartingPosition: Vector3;

			// line + arc
			if ( firstSegment >= secondSegment ) {

				const t = ( firstSegment - secondSegment ) / firstSegment;

				const lineLength = firstSegment - secondSegment;

				arcStartingPosition = Maths.linearInterpolationVector3( p1, p2, t );

				const line = new TvLineGeometry( 0, x, y, hdg, lineLength );

				const end = line.end;

				const arc = this.createArcGeometry( line.endS, end.x, end.y, arcStartingPosition, hdg, p3, hdg2, p2 );

				this.mGeometries.push( line );
				this.mGeometries.push( arc );

				// arc + line
			} else if ( secondSegment > firstSegment ) {

				const t = firstSegment / secondSegment;

				const lineLength = secondSegment - firstSegment;

				const lineStartingPosition = Maths.linearInterpolationVector3( p2, p3, t );

				const arc = this.createArcGeometry( 0, x, y, p1, hdg, lineStartingPosition, hdg2, p2 );

				const pos = arc.getRoadCoord( arc.endS );

				const line = new TvLineGeometry( arc.endS, pos.x, pos.y, pos.hdg, lineLength );

				this.mGeometries.push( arc );
				this.mGeometries.push( line );
			}
		}
	}

	private createArcGeometry ( s: number, x: number, y: number, p1: Vector3, hdg: number, p3: Vector3, hdg2: number, p2: Vector3 ): any {

		const res = this.getRadius( p1, hdg, p3, hdg2 );

		const radius = res.radius;
		const center = res.center;

		let curvature = 1 / radius;

		const doCurvature = Maths.angle( center, p1, p3 );

		const arcLength = doCurvature * radius;

		// make the curvature negative for right side i.e. for clockwise
		const side = Maths.direction( p2, p3, p1 );
		if ( side === TvSide.RIGHT ) curvature *= -1;

		return new TvArcGeometry( s, x, y, hdg, arcLength, curvature );
	}

	private getRadius ( A: Vector3, line1Hdg: number, C: Vector3, line2Hdg: number ): any {

		const B = new Vector3(
			A.x + Math.cos( line1Hdg + Maths.PI2 ) * 1,
			A.y + Math.sin( line1Hdg + Maths.PI2 ) * 1
		);

		const D = new Vector3(
			C.x + Math.cos( line2Hdg + Maths.PI2 ) * 1,
			C.y + Math.sin( line2Hdg + Maths.PI2 ) * 1
		);

		const center = Maths.lineLineIntersection( A, B, C, D );

		const radius = A.distanceTo( center );

		return {
			radius,
			center
		};

	}

}


export class BSplineCurve3 extends Curve<Vector3> {

	constructor ( private points?: Vector3[], private closed?: boolean, private curveType?: string, private tension?: number ) {
		super();
	}

	getPoint ( t: number ): Vector3 {

		return new Vector3();
	}
}
