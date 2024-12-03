/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SplineType } from 'app/core/shapes/spline-type';
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

	fix ( spline: AbstractSpline, log = true ): void {

		if ( !this.enabled ) return;

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

	private fixMinSegmentCount ( spline: AbstractSpline ): void {

		if ( spline.getSegmentCount() == 0 ) {

			const road = this.roadFactory.createDefaultRoad();

			road.spline = spline;

			spline.addSegment( 0, road );

			this.mapService.map.addRoad( road );

			// TODO: check if need this or not
			// this.roadManager.addRoad( road );

			if ( this.debug ) Log.warn( "Fixing No segments found, adding default road", road.toString() );

		}

	}

	private fixFirstSegment ( spline: AbstractSpline ): void {

		if ( spline.getSegmentCount() >= 1 ) {

			const firstSegment = spline.getFirstSegment();

			if ( firstSegment instanceof TvRoad ) {

				firstSegment.sStart = 0;

			}

			// get first key
			const firstKey = spline.getSegmentKeys()[ 0 ];

			if ( !Maths.approxEquals( firstKey, 0 ) ) {

				if ( this.debug ) Log.warn( "Fixing sStart is not equal to 0", firstSegment.toString() );

				SplineUtils.removeSegment( spline, firstSegment );

				SplineUtils.addSegment( spline, 0, firstSegment );

			}
		}

	}

	private fixEachSegmentStart ( spline: AbstractSpline ): void {

		spline.forEachSegment( ( segment, sOffset ) => {

			if ( segment instanceof TvRoad ) {

				if ( !Maths.approxEquals( segment.sStart, sOffset ) ) {

					segment.sStart = sOffset;

					if ( this.debug ) Log.warn( "Fixing sStart is not equal to sOffset", segment.toString() );
				}

			}

		} );

	}

	private fixDuplicateSegments ( spline: AbstractSpline ): void {

		if ( spline.type != SplineType.AUTOV2 ) return;

		// for auto splines we can remove some road segments which are not needed

		let index = 0;

		spline.getSegments().forEach( segment => {

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

	public fixInternalLinks ( spline: AbstractSpline, setNull = false ): void {

		// TODO: we need to check
		// const predecessor = SplineUtils.findPredecessor( spline );
		// const successor = SplineUtils.findSuccessor( spline );

		if ( !SplineUtils.areLinksCorrect( spline ) ) {
			Log.warn( "Fixing incorrect links", spline?.toString() );
		}

		spline.updateLinks();

	}

}
