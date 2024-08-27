/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvRoad } from 'app/map/models/tv-road.model';
import { MapService } from '../map/map.service';
import { RoadLinkService } from '../road/road-link.service';
import { TvContactPoint } from 'app/map/models/tv-common';
import { SplineUtils } from 'app/utils/spline.utils';
import { TvRoadLinkType } from 'app/map/models/tv-road-link';
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class SplineSegmentService {

	constructor (
		private mapService: MapService,
		private linkService: RoadLinkService,
	) { }

	removeSegments ( spline: AbstractSpline ): void {

		this.removeRoadSegments( spline );

		this.removeJunctionSegments( spline );

	}

	removeJunctionSegments ( spline: AbstractSpline ): void {

		spline.getJunctionSegments().forEach( junction => {

			if ( this.mapService.hasJunction( junction ) ) {

				this.mapService.removeJunction( junction );

			} else {

				Log.warn( "Junction already removed", junction.toString() );

			}

		} );

	}

	removeRoadSegments ( spline: AbstractSpline ): void {

		spline.getRoadSegments().forEach( road => {

			if ( this.mapService.hasRoad( road ) ) {

				this.mapService.removeRoad( road );

			} else {

				Log.warn( "Road already removed", road.toString() );

			}

		} );

	}

	addSegment ( spline: AbstractSpline, sOffset: number, segment: TvRoad | TvJunction ): void {

		if ( segment instanceof TvRoad ) {

			this.addRoadSegment( spline, sOffset, segment );

		} else if ( segment instanceof TvJunction ) {

			this.addJunctionSegment( spline, sOffset, segment );

		} else {

			throw new Error( 'Unknown segment type' );

		}

	}

	removeSegment ( spline: AbstractSpline, segment: TvRoad | TvJunction ): void {

		if ( segment instanceof TvRoad ) {

			this.removeRoadSegment( spline, segment );

		} else if ( segment instanceof TvJunction ) {

			this.removeJunctionSegment( spline, segment );

		} else {

			throw new Error( 'Unknown segment type' );

		}

	}

	private addRoadSegment ( spline: AbstractSpline, sOffset: number, newRoad: TvRoad ) {

		const currentSegment = spline.segmentMap.findAt( sOffset );

		if ( currentSegment instanceof TvRoad ) {

			this.linkService.setSuccessor( currentSegment, newRoad, TvContactPoint.START );

		}

		SplineUtils.addSegment( spline, sOffset, newRoad );

		this.mapService.addRoad( newRoad );

	}

	private addJunctionSegment ( spline: AbstractSpline, sOffset: number, junction: TvJunction ) {

	}

	private removeRoadSegment ( spline: AbstractSpline, road: TvRoad ) {

		const predecessor = road.predecessor;
		const successor = road.successor;

		if ( !SplineUtils.hasSegment( spline, road ) ) {
			throw new Error( 'Segment not found' );
		}

		if ( successor?.element instanceof TvRoad && predecessor?.element instanceof TvRoad ) {

			predecessor.element.setSuccessorRoad( successor.element, successor.contact );

			successor.element.setPredecessorRoad( predecessor.element, predecessor.contact );

		} else if ( successor?.element instanceof TvJunction && predecessor?.element instanceof TvRoad ) {

			predecessor.element.setSuccessor( TvRoadLinkType.JUNCTION, successor.element as TvJunction );

			this.linkService.replaceJunctionLinks( successor.element as TvJunction, road, predecessor.element, predecessor.contact );

		}

		SplineUtils.removeSegment( spline, road );

		this.mapService.removeRoad( road );

	}

	private removeJunctionSegment ( spline: AbstractSpline, junction: TvJunction ) {

	}

}
