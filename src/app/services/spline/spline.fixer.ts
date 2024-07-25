import { Injectable } from "@angular/core";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { RoadFactory } from "app/factories/road-factory.service";
import { MapService } from "../map/map.service";
import { SplineService } from "./spline.service";
import { TvRoad } from "app/map/models/tv-road.model";
import { Maths } from "app/utils/maths";
import { RoadManager } from "app/managers/road/road-manager";
import { Log } from "app/core/utils/log";
import { RoadUtils } from "app/utils/road.utils";
import { TvContactPoint } from "app/map/models/tv-common";
import { SplineUtils } from "app/utils/spline.utils";

@Injectable( {
	providedIn: 'root'
} )
export class SplineFixerService {

	private debug = true;

	constructor (
		private mapService: MapService,
		private roadFactory: RoadFactory,
		private splineService: SplineService,
		private roadManager: RoadManager,
	) {
	}

	fix ( spline: AbstractSpline ) {

		if ( spline.controlPoints.length < 2 ) return;

		this.fixMinSegmentCount( spline );

		this.fixFirstSegment( spline );

		this.fixEachSegmentStart( spline );

		this.fixDuplicateSegments( spline );

		this.fixUnLinkedSegments( spline );

	}

	private fixMinSegmentCount ( spline: AbstractSpline ) {

		if ( spline.segmentMap.length == 0 ) {

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

		if ( spline.segmentMap.length >= 1 ) {

			const segment = this.splineService.findFirstRoad( spline );

			if ( segment ) {

				segment.sStart = 0;

			}

			// get first key
			const firstKey = spline.segmentMap.keys().next().value;

			if ( !Maths.approxEquals( firstKey, 0 ) ) {

				SplineUtils.addSegment( spline, 0, segment );

				if ( this.debug ) Log.warn( "Fixing sStart is not equal to 0", segment.toString() );
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
			if ( index == 0 || index == spline.segmentMap.length - 1 ) {
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

	// road segments should be linked to each other
	private fixUnLinkedSegments ( spline: AbstractSpline ) {

		if ( spline.type != SplineType.AUTOV2 ) return;

		const segments = spline.segmentMap.values();

		for ( let currentSegment of segments ) {

			if ( currentSegment instanceof TvRoad ) {

				const nextSegment = spline.segmentMap.getNext( currentSegment );

				if ( nextSegment instanceof TvRoad && currentSegment.successor == null ) {

					if ( this.debug ) Log.warn( "Fixing Links", currentSegment.toString(), nextSegment.toString() );

					RoadUtils.linkSuccessor( currentSegment, nextSegment, TvContactPoint.START );

				}

				if ( nextSegment instanceof TvRoad && nextSegment.predecessor == null ) {

					if ( this.debug ) Log.warn( "Fixing Links", currentSegment.toString(), nextSegment.toString() );

					RoadUtils.linkSuccessor( currentSegment, nextSegment, TvContactPoint.START );

				}

			}

		}

	}


}
