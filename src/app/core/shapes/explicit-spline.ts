/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/map/models/tv-road.model';
import { AbstractSpline } from './abstract-spline';
import { SplineType } from './spline-type';
import { Vector3 } from 'three';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { ExplicitGeometryService } from 'app/services/spline/explicit-geometry.service';
import { SplineBoundsService } from 'app/services/spline/spline-bounds.service';

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

	updateSegmentGeometryAndBounds (): void {

		if ( this.getControlPointCount() < 2 ) {
			this.clearGeometries();
			this.clearSegmentGeometries();
			this.centerPoints = [];
			this.leftPoints = [];
			this.rightPoints = [];
			return;
		}

		ExplicitGeometryService.instance.updateGeometry( this );

		this.fireMakeSegmentMeshEvents();

		SplineBoundsService.instance.updateBounds( this );

	}

}
