/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { RoadFactory } from "app/factories/road-factory.service";
import { MapService } from "../map/map.service";
import { TvRoad } from "app/map/models/tv-road.model";
import { Maths } from "app/utils/maths";
import { RoadManager } from "app/managers/road/road-manager";
import { Log } from "app/core/utils/log";
import { SplineUtils } from "app/utils/spline.utils";


@Injectable( {
	providedIn: 'root'
} )
export class SplineFixerService {

	private debug = true;

	private enabled = true;

	constructor (
		private mapService: MapService,
		private roadFactory: RoadFactory,
		private roadManager: RoadManager,
	) {
	}

	fix ( spline: AbstractSpline, log = true ) {

		if ( !this.enabled ) return;

		if ( spline.controlPoints.length < 2 ) {
			this.removeExtraSegments( spline );
			return;
		}

		if ( !SplineUtils.areLinksCorrect( spline ) && log ) {
			console.log( "Links are not correct", spline );
			Log.error( "Links are not correct", spline?.toString() );
		}

		this.fixMinSegmentCount( spline );

		this.fixFirstSegment( spline );

		this.fixEachSegmentStart( spline );

		// this.fixDuplicateSegments( spline );

		// this.fixUnLinkedSegments( spline );

		this.fixInternalLinks( spline );
	}

	removeExtraSegments ( spline: AbstractSpline ): void {

		const roads = spline.getRoadSegments();

		// start from 2nd road
		for ( let i = 1; i < roads.length; i++ ) {

			this.roadManager.removeRoad( roads[ i ] );

		}

		this.fixInternalLinks( spline, true );

	}

	private fixMinSegmentCount ( spline: AbstractSpline ) {

		if ( spline.getSegmentCount() == 0 ) {

			const road = this.roadFactory.createDefaultRoad();

			road.spline = spline;

			spline.segmentMap.set( 0, road );

			this.mapService.map.addRoad( road );

			// TODO: check if need this or not
			// this.roadManager.addRoad( road );

			if ( this.debug ) Log.warn( "Fixing No segments found, adding default road", road.toString() );

		}

	}

	private fixFirstSegment ( spline: AbstractSpline ) {

		if ( spline.getSegmentCount() >= 1 ) {

			const firstSegment = spline.segmentMap.getFirst();

			if ( firstSegment instanceof TvRoad ) {

				firstSegment.sStart = 0;

			}

			// get first key
			const firstKey = spline.segmentMap.keys().next().value;

			if ( !Maths.approxEquals( firstKey, 0 ) ) {

				if ( this.debug ) Log.warn( "Fixing sStart is not equal to 0", firstSegment.toString() );

				SplineUtils.removeSegment( spline, firstSegment );

				SplineUtils.addSegment( spline, 0, firstSegment );

			}
		}

	}

	private fixEachSegmentStart ( spline: AbstractSpline ) {

		spline.segmentMap.forEach( ( segment, sOffset ) => {

			if ( segment instanceof TvRoad ) {

				if ( !Maths.approxEquals( segment.sStart, sOffset ) ) {

					segment.sStart = sOffset;

					if ( this.debug ) Log.warn( "Fixing sStart is not equal to sOffset", segment.toString() );
				}

			}

		} );

	}

	private fixDuplicateSegments ( spline: AbstractSpline ) {

		if ( spline.type != SplineType.AUTOV2 ) return;

		// for auto splines we can remove some road segments which are not needed

		let index = 0;

		spline.segmentMap.forEach( ( segment, sOffset ) => {

			// cannot remove first and last segment
			if ( index == 0 || index == spline.getSegmentCount() - 1 ) {
				index++
				return;
			}

			if ( segment instanceof TvRoad ) {

				if ( segment.successor?.isRoad && segment.predecessor?.isRoad ) {

					if ( this.debug ) Log.warn( "Fixing Duplicates", segment.toString() );

					this.roadManager.removeRoad( segment );

				}

			}

		} );

	}

	public fixInternalLinks ( spline: AbstractSpline, setNull = false ) {

		// TODO: we need to check
		// const predecessor = SplineUtils.findPredecessor( spline );
		// const successor = SplineUtils.findSuccessor( spline );

		if ( !SplineUtils.areLinksCorrect( spline ) ) {
			Log.warn( "Fixing incorrect links", spline?.toString() );
		}

		this.setInternalLinks( spline );

	}

	public setInternalLinks ( spline: AbstractSpline ): void {

		SplineUtils.updateInternalLinks( spline );

	}

}
