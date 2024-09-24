/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline, SplineType } from './abstract-spline';

export class ExplicitSpline extends AbstractSpline {

	public type: SplineType = SplineType.EXPLICIT;

	constructor ( road?: TvRoad ) {

		super();

		if ( road ) this.addSegment( 0, road );

	}

	init (): void { }

	update (): void { }

}
