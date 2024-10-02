/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline, SplineType } from './abstract-spline';
import { Vector3 } from 'three';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';

export class ExplicitSpline extends AbstractSpline {

	public type: SplineType = SplineType.EXPLICIT;

	constructor ( road?: TvRoad ) {

		super();

		if ( road ) this.addSegment( 0, road );

	}

	init (): void { }

	update (): void { }

	getPoints ( stepSize: number ): Vector3[] {

		const points: TvPosTheta[] = []

		for ( let s = 0; s < this.getLength(); s += stepSize ) {
			points.push( this.getCoordAtOffset( s ) );
		}

		return points.map( p => p.position );
	}

}
