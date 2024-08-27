/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { AbstractSpline, SplineType } from './abstract-spline';

export class AutoSpline extends AbstractSpline {

	public type: SplineType = SplineType.AUTOV2;

	constructor () {

		super();

	}

	exportGeometries (): TvAbstractRoadGeometry[] {

		if ( this.controlPoints.length < 2 ) return [];

	}

}
