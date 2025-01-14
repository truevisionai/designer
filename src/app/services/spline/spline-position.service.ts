/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { Maths } from 'app/utils/maths';
import { Vector3 } from 'app/core/maths';

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

		const previousPoint = spline.getControlPoints()[ index - 1 ];

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

}
