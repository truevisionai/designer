import { Injectable } from '@angular/core';
import { BaseService } from '../base.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationService extends BaseService {

	createDefaultNodes ( road: TvRoad ) {

		if ( road.spline.controlPoints.length < 2 ) return;

		if ( road.elevationProfile.getElevationCount() === 0 ) {

			// add elevation at begininng
			const firstNode = road.addElevation( 0, 0, 0, 0, 0 );

			// add elevation at end
			const lastNode = road.addElevation( road.length, 0, 0, 0, 0 );

			firstNode.node = new RoadElevationNode( road, firstNode );

			lastNode.node = new RoadElevationNode( road, lastNode );
		}

	}

	updateNodes ( road: TvRoad ) {

		road.getElevationProfile().getElevations().forEach( elevation => {

			elevation.node?.updateValuesAndPosition();

		} );

	}

}
