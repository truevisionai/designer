/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvCornerRoad } from 'app/map/models/objects/tv-corner-road';
import { TvRoad } from 'app/map/models/tv-road.model';
import { MapService } from '../map/map.service';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvObjectOutline } from 'app/map/models/objects/tv-object-outline';
import { TvCornerLocal } from 'app/map/models/objects/tv-corner-local';
import { RoadService } from '../road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class CornerRoadFactory {

	constructor (
		private mapService: MapService,
		private roadService: RoadService,
	) { }

	createCornerRoad ( road: TvRoad, s: number, t: number, z: number = 0 ): TvCornerRoad {

		const coord = this.roadService.getRoadCoordAt( road, s, t );

		if ( !coord ) {
			console.error( 'Road coord not found' );
			return;
		}

		const point = this.createFromCoord( coord );

		point.dz = z;

		return point;

	}

	createFromCoord ( coord: TvRoadCoord ): TvCornerRoad {

		return new TvCornerRoad( 0, coord.road, coord.s, coord.t, 0, null );

	}

	createCornerRoadOutline ( road: TvRoad, outline: TvObjectOutline, s: number, t: number, height: number = 0.0, dz = 0.0 ) {

		const id = outline.cornerLocal.length + outline.cornerRoad.length;

		return new TvCornerRoad( id, road, s, t, dz, height );

	}

	createCornerLocalOutline ( outline: TvObjectOutline, u: number, v: number, z: number = 0.0, height = 0.0 ) {

		const id = outline.cornerLocal.length + outline.cornerRoad.length;

		return new TvCornerLocal( id, u, v, z, height );

	}

}
