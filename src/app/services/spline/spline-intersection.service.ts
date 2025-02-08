/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineIntersection } from '../junction/spline-intersection';
import { MapService } from '../map/map.service';
import { findIntersectionsViaBox2D } from "./spline-intersection-helper";

@Injectable( {
	providedIn: 'root'
} )
export class SplineIntersectionService {

	constructor (
		private mapService: MapService
	) { }

	findIntersections ( spline: AbstractSpline, otherSplines: any = null ): SplineIntersection[] {

		if ( spline.getControlPointCount() < 2 ) return [];

		const splines = otherSplines || this.mapService.nonJunctionSplines;

		const intersections: SplineIntersection[] = [];

		for ( const otherSpline of splines ) {

			if ( spline.equals( otherSpline ) ) continue;
			if ( spline.isLinkedTo( otherSpline ) ) continue;

			findIntersectionsViaBox2D( spline, otherSpline ).forEach( intersection => {
				intersections.push( intersection );
			} );

		}

		return intersections;

	}

}


