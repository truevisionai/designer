/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { AbstractSpline } from './abstract-spline';
import { SplineType } from './spline-type';
import { Vector3 } from 'three';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { AutoGeometryService } from 'app/services/spline/auto-geometry.service';
import { SplineBoundsService } from 'app/services/spline/spline-bounds.service';

export class AutoSpline extends AbstractSpline {

	public type: SplineType = SplineType.AUTOV2;

	constructor () {

		super();

	}

	exportGeometries (): TvAbstractRoadGeometry[] {
		if ( this.controlPoints.length < 2 ) return [];
	}

	getPoints ( stepSize: number ): Vector3[] {

		const points: TvPosTheta[] = []

		for ( let s = 0; s < this.getLength(); s += stepSize ) {
			points.push( this.getCoordAtOffset( s ) );
		}

		return points.map( p => p.position );

	}

	updateSegmentGeometryAndBounds (): void {

		if ( this.controlPoints.length < 2 ) return;

		AutoGeometryService.instance.updateGeometry( this );

		this.fireMakeSegmentMeshEvents();

		SplineBoundsService.instance.updateBounds( this );

	}


}
