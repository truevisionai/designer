/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { Maths } from 'app/utils/maths';
import { Vector2, Vector3 } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class SplinePositionService {

	constructor () { }

	getCoordAtOffset ( spline: AbstractSpline, sOffset: number ): TvPosTheta {

		for ( const geometry of spline.getGeometries() ) {

			if ( sOffset >= geometry.s && sOffset <= geometry.endS ) {

				return geometry.getRoadCoord( sOffset );

			}

		}

	}

	getCoordAt ( spline: AbstractSpline, point: Vector3 ): TvPosTheta {

		return spline.getCoordAtPosition( point );

	}

	getHeading ( spline: AbstractSpline, index: number, position: Vector3 ): number {

		const previousPoint = spline.controlPoints[ index - 1 ];

		let hdg: number = 0;

		if ( previousPoint ) {

			// hdg from previous point to new point
			hdg = Maths.heading( previousPoint.position, position );

			if ( isNaN( hdg ) ) {
				hdg = Maths.vec2Angle( previousPoint.position.x, previousPoint.position.y );
			}

			if ( isNaN( hdg ) ) {
				hdg = 0;
			}

		}

		return hdg;
	}


	getPoints ( spline: AbstractSpline, step: number ): Vector3[] {

		if ( spline instanceof CatmullRomSpline ) {
			return spline.getPoints();
		}

		const points: Vector3[] = [];

		const length = spline.getLength();

		if ( length == 0 ) return [];

		const d = step / length;

		for ( let i = 0; i <= 1; i += d ) {

			const point = this.getPoint( spline, i, 0 );

			if ( point instanceof Vector3 ) {

				points.push( point );

			} else {

				points.push( point.toVector3() );

			}

		}

		return points;

	}

	getPoint ( spline: AbstractSpline, t: number, offset: number ): Vector3 | TvPosTheta {

		if ( spline instanceof CatmullRomSpline ) {
			return spline.curve.getPointAt( t );
		}

		const length = spline.getLength();

		const s = length * t;

		const geometry = spline.getGeometries().find( g => s >= g.s && s <= g.endS );

		if ( !geometry ) {
			console.error( 'No geometry found for s:', s, spline );
			return new TvPosTheta();
		}

		const posTheta = geometry.getRoadCoord( s );

		posTheta.addLateralOffset( offset );

		return posTheta;

	}

}
