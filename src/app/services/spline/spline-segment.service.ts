/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineSegmentType } from 'app/core/shapes/spline-segment';
import { TvConsole } from 'app/core/utils/console';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector3 } from 'three';
import { SegmentManager } from './segment.manager';

@Injectable( {
	providedIn: 'root'
} )
export class SplineSegmentService {

	private splines: Map<AbstractSpline, Map<number, number>> = new Map();

	constructor (
		private segmentManager: SegmentManager
	) {
	}

	addJunctionSegment ( spline: AbstractSpline, sStart: number, junction: TvJunction ) {

		if ( sStart > spline.getLength() ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart < 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		spline.addJunctionSegment( sStart, junction );
	}

	addEmptySegment ( spline: AbstractSpline, sStart: number ) {

		if ( sStart > spline.getLength() ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart < 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		spline.addSegmentSection( sStart, -1, SplineSegmentType.NONE, null );
	}

	addRoadSegmentNew ( spline: AbstractSpline, sStart: number, road: TvRoad ) {

		if ( sStart > spline.getLength() ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart < 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		spline.addRoadSegment( sStart, road );

	}

	removeRoadSegment ( spline: AbstractSpline, road: TvRoad ) {

		if ( !spline.findSegment( road ) ) return;

		this.removeSegment( spline, road );

	}

	removeJunctionSegment ( spline: AbstractSpline, junction: TvJunction ) {

		if ( !spline.findSegment( junction ) ) return;

		this.removeSegment( spline, junction );

	}

	getWidthCache ( spline: AbstractSpline ) {

		if ( !this.splines.has( spline ) ) {

			return this.updateWidthCache( spline );

		}

		return this.splines.get( spline );

	}

	updateWidthCache ( spline: AbstractSpline ) {

		const cache = new Map<number, number>();

		const segments = spline.getSplineSegments();

		let lastWidth = -1;

		for ( const segment of segments ) {

			if ( !segment.isRoad ) continue;

			const road = segment.getInstance<TvRoad>();

			if ( !road ) continue;

			for ( let s = 0; s <= road.length; s += 5 ) {

				const width = road.getRoadWidthAt( s ).totalWidth;

				if ( width !== lastWidth ) {

					cache.set( road.sStart + s, width );

					lastWidth = width;

				}

			}

		}

		this.splines.set( spline, cache );

		return cache;
	}

	getWidthAt ( spline: AbstractSpline, position?: Vector3, inputS?: number ): number {

		const cache = this.getWidthCache( spline );

		const checkS = inputS || spline.getCoordAt( position )?.s;

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

	private removeSegment ( spline: AbstractSpline, query: TvRoad | TvJunction ): void {

		const segments = spline.getSplineSegments();

		const segment = segments.find( i => i.segment == query );

		if ( !segment ) {

			console.error( 'segment not found' + query.toString() );

			TvConsole.error( 'segment not found' + query.toString() );

			return;

		}

		spline.removeSegment( segment );

		this.segmentManager.onRemoved( spline, segment );

	}
}
