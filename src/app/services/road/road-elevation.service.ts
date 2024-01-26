/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapEvents } from 'app/events/map-events';
import { RoadUpdatedEvent } from 'app/events/road/road-updated-event';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvElevation } from 'app/map/models/tv-elevation';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvUtils } from 'app/map/models/tv-utils';
import { Vector3 } from 'three';
import { RoadService } from './road.service';

@Injectable( {
	providedIn: 'root'
} )
export class RoadElevationService {

	constructor (
		private roadService: RoadService
	) { }

	createElevation ( road: TvRoad, point: Vector3 ) {

		const roadCoord = road.getPosThetaByPosition( point ).toRoadCoord( road );

		return this.createElevationAt( roadCoord );
	}

	createElevationAt ( roadCoord: TvRoadCoord ) {

		const elevation = roadCoord.road.getElevationAt( roadCoord.s ).clone( roadCoord.s );

		elevation.a = roadCoord.road.getElevationValue( roadCoord.s );

		return elevation;

	}

	addElevation ( road: TvRoad, elevation: TvElevation ) {

		road.addElevationInstance( elevation );

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		this.roadService.updateRoad( road );

	}

	removeElevation ( road: TvRoad, elevation: TvElevation ) {

		road.removeElevationInstance( elevation );

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		this.roadService.updateRoad( road );

	}

	updateElevation ( road: TvRoad, elevation: TvElevation ) {

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		this.roadService.updateRoad( road );

	}

}
