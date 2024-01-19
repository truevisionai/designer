import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineSegmentType } from 'app/core/shapes/spline-segment';
import { TvConsole } from 'app/core/utils/console';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

@Injectable( {
	providedIn: 'root'
} )
export class SplineSegmentService {

	constructor () { }

	addJunctionSegment ( spline: AbstractSpline, sStart: number, junction: TvJunction ) {

		if ( sStart >= spline.getLength() ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart <= 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		spline.addJunctionSegment( sStart, junction );
	}

	addEmptySegment ( spline: AbstractSpline, sStart: number ) {

		if ( sStart >= spline.getLength() ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart <= 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		spline.addSegmentSection( sStart, -1, SplineSegmentType.NONE, null );
	}

	addRoadSegmentNew ( spline: AbstractSpline, sStart: number, road: TvRoad ) {

		if ( sStart >= spline.getLength() ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart <= 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		spline.addRoadSegment( sStart, road );

	}

	removeRoadSegment ( spline: AbstractSpline, road: TvRoad ) {

		if ( !spline.findSegment( road ) ) return;

		spline.removeSegment( road );

		if ( spline.getSplineSegments().length == 0 ) {

			// this.mapService.map.removeSpline( road.spline );

		}

	}

	removeJunctionSegment ( spline: AbstractSpline, junction: TvJunction ) {

		if ( !spline.findSegment( junction ) ) return;

		spline.removeSegment( junction );

		// this.splineService.updateSpline( spline );

	}


}
