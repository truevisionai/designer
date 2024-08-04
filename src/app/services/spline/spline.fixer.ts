import { Injectable } from "@angular/core";
import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { RoadFactory } from "app/factories/road-factory.service";
import { MapService } from "../map/map.service";
import { TvRoad } from "app/map/models/tv-road.model";
import { Maths } from "app/utils/maths";
import { RoadManager } from "app/managers/road/road-manager";
import { Log } from "app/core/utils/log";
import { RoadUtils } from "app/utils/road.utils";
import { TvContactPoint } from "app/map/models/tv-common";
import { SplineUtils } from "app/utils/spline.utils";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoadLinkType } from "app/map/models/tv-road-link";

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

	fix ( spline: AbstractSpline ) {

		if ( !this.enabled ) return;

		if ( spline.controlPoints.length < 2 ) return;

		this.fixMinSegmentCount( spline );

		this.fixFirstSegment( spline );

		this.fixEachSegmentStart( spline );

		// this.fixDuplicateSegments( spline );

		// this.fixUnLinkedSegments( spline );

		this.fixInternalLinks( spline );
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

	public fixInternalLinks ( spline: AbstractSpline, setNull = false ) {

		// TODO: we need to check
		// const predecessor = SplineUtils.findPredecessor( spline );
		// const successor = SplineUtils.findSuccessor( spline );

		if ( !SplineUtils.areLinksCorrect( spline ) ) {
			Log.warn( "Fixing incorrect links", spline?.toString() );
		}

		const fixSuccessor = ( road: TvRoad, nextSegment: TvRoad | TvJunction ) => {

			if ( nextSegment instanceof TvRoad ) {

				road.setSuccessorRoad( nextSegment, TvContactPoint.START );

			} else if ( nextSegment instanceof TvJunction ) {

				road.setSuccessor( TvRoadLinkType.JUNCTION, nextSegment );

			} else {

				// if ( setNull ) segment.successor = null;

			}

		}

		const fixPredecessor = ( road: TvRoad, prevSegment: TvRoad | TvJunction ) => {

			if ( prevSegment instanceof TvRoad ) {

				road.setPredecessorRoad( prevSegment, TvContactPoint.END );

			} else if ( prevSegment instanceof TvJunction ) {

				road.setPredecessor( TvRoadLinkType.JUNCTION, prevSegment );

			} else {

				// if ( setNull ) segment.predecessor = null;

			}

		}


		let index = 0;

		spline.segmentMap.forEach( ( segment, sOffset ) => {

			const prevSegment = spline.segmentMap.getPrevious( segment );
			const nextSegment = spline.segmentMap.getNext( segment );

			if ( segment instanceof TvRoad ) {

				fixSuccessor( segment, nextSegment );

				fixPredecessor( segment, prevSegment );

			}

			index++;

		} );

	}
}
