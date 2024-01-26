/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SplineSegmentService } from './spline-segment.service';
import { RoadBuilder } from 'app/map/builders/road.builder';

@Injectable( {
	providedIn: 'root'
} )
export class SplineBuilder {

	constructor (
		private segmentService: SplineSegmentService,
		private roadBuilder: RoadBuilder,
	) { }

	buildSpline ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		spline.update();

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( !segment.isRoad ) continue;

			const road = segment.getInstance<TvRoad>();

			road.clearGeometries();

			if ( segment.geometries.length == 0 ) {

				this.segmentService.removeRoadSegment( spline, road );

				console.error( 'segment.geometries.length == 0', spline );

				continue;
			}

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			this.roadBuilder.rebuildRoad( road )

		}

	}

}
