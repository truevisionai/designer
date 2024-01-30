/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SplineSegmentService } from './spline-segment.service';
import { RoadBuilder } from 'app/map/builders/road.builder';
import { TvConsole } from 'app/core/utils/console';
import { MapService } from '../map/map.service';

@Injectable( {
	providedIn: 'root'
} )
export class SplineBuilder {

	constructor (
		private segmentService: SplineSegmentService,
		private roadBuilder: RoadBuilder,
		private mapService: MapService,
	) {
	}

	buildSpline ( spline: AbstractSpline ) {

		const segments = spline.getSplineSegments();

		if ( spline.controlPoints.length < 2 ) {

			this.removeMesh( spline );

			return;
		}

		spline.update();


		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( !segment.isRoad ) continue;

			const road = segment.getInstance<TvRoad>();

			road.clearGeometries();

			if ( segment.geometries.length == 0 ) {

				this.segmentService.removeRoadSegment( spline, road );

				TvConsole.error( 'segment.geometries.length == 0' );

				console.error( 'segment.geometries.length == 0', spline );

				continue;
			}

			segment.geometries.forEach( geometry => road.addGeometry( geometry ) );

			this.roadBuilder.rebuildRoad( road )

		}

	}


	removeMesh ( spline: AbstractSpline ) {

		const segments = spline.getSplineSegments();

		for ( let i = 0; i < segments.length; i++ ) {

			const segment = segments[ i ];

			if ( !segment.isRoad ) continue;

			const road = segment.getInstance<TvRoad>();

			if ( !road ) continue;

			if ( !road.gameObject ) continue;

			this.mapService.map.gameObject.remove( road.gameObject );

		}

	}

}
