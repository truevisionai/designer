/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineType } from 'app/core/shapes/spline-type';
import { TvRoad } from "../../map/models/tv-road.model";
import { AutoSpline } from "../../core/shapes/auto-spline-v2";
import { CatmullRomCurve3, Vector3 } from "three";
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { CatmullRomSpline } from 'app/core/shapes/catmull-rom-spline';
import { Log } from 'app/core/utils/log';
import { SplineSegmentService } from './spline-segment.service';
import { SplineBoundsService } from './spline-bounds.service';
import { ExplicitGeometryService } from "./explicit-geometry.service";
import { AutoGeometryService } from "./auto-geometry.service";
import { MapEvents } from 'app/events/map-events';

@Injectable( {
	providedIn: 'root'
} )
export class SplineGeometryGenerator {

	constructor (
		private segmentService: SplineSegmentService,
		private autoSplineBuilder: AutoGeometryService,
		private explicitSplineBuilder: ExplicitGeometryService,
		private splineBoundService: SplineBoundsService,
	) {
	}

	generateGeometryAndBuildSegmentsAndBounds ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) {
			Log.warn( 'No control points found in spline', spline?.toString() );
			return;
		}

		this.buildGeometry( spline );

		this.buildSegments( spline );

		this.updateBounds( spline );

	}

	updateBounds ( spline: AbstractSpline ): void {

		this.splineBoundService.updateBounds( spline );

	}

	removeGeometry ( spline: AbstractSpline ): void {

		spline.clearGeometries();

		spline.clearSegmentGeometries();

	}

	buildGeometry ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) {
			Log.warn( 'No control points found in spline', spline?.toString() );
			return;
		}

		if ( spline instanceof AutoSpline ) {

			this.autoSplineBuilder.updateGeometry( spline );

		} else if ( spline instanceof ExplicitSpline ) {

			this.explicitSplineBuilder.updateGeometry( spline );

		} else if ( spline instanceof CatmullRomSpline ) {

			this.buildCatmullRomSpline( spline );

		}

	}

	/**
	 *
	 * @param spline
	 * @deprecated
	 */
	buildSpline ( spline: AbstractSpline ): void {

		this.buildGeometry( spline );

	}

	buildSegments ( spline: AbstractSpline ): void {

		for ( const segment of spline.getSegments() ) {

			if ( segment instanceof TvRoad ) {

				try {

					MapEvents.makeMesh.emit( segment );

				} catch ( error ) {

					Log.error( 'Error rebuilding spline segment', segment.toString() );

					Log.error( error );

					this.segmentService.removeSegment( spline, segment );

				}

			}

		}

	}

	buildCatmullRomSpline ( spline: CatmullRomSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		if ( !spline.curve ) return;

		spline.curve.points = spline.controlPointPositions;

		spline.curve.closed = spline.closed;

		spline.curve.updateArcLengths();

	}

	buildNew ( spline: AbstractSpline ): void {

		if ( spline.type === SplineType.CATMULLROM ) {

			this.buildCatmullRom( spline as CatmullRomSpline );

		}

	}

	buildCatmullRom ( spline: CatmullRomSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		if ( !spline.curve ) {
			spline.curve = new CatmullRomCurve3(
				spline.controlPointPositions,
				spline.closed,
				spline.curveType,
				spline.tension
			);
		}

		spline.curve.points = spline.controlPointPositions;

		spline.curve.updateArcLengths();

	}

	getWidthAt ( spline: AbstractSpline, position?: Vector3, inputS?: number ): number {

		const cache = spline.widthCache;

		const checkS = inputS //;|| spline.getCoordAt( position )?.s;

		// Find the closest entry that is less than or equal to coord.s
		let closestS = -Infinity;

		let closestWidth = 12; // Default width

		for ( const [ s, width ] of cache ) {

			if ( s <= checkS && s > closestS ) {

				closestS = s;

				closestWidth = width;

			}

		}

		return closestWidth;

	}
}


