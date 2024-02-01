/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvUtils } from 'app/map/models/tv-utils';
import { Vector3 } from 'three';
import { RoadService } from '../../services/road/road.service';
import { LinkedDataService } from "../../core/interfaces/data.service";

@Injectable( {
	providedIn: 'root'
} )
export class TvElevationService extends LinkedDataService<TvRoad, TvElevation> {

	constructor (
		private roadService: RoadService
	) {
		super();
	}

	createElevation ( road: TvRoad, point: Vector3 ) {

		const roadCoord = road.getPosThetaByPosition( point ).toRoadCoord( road );

		return this.createElevationAt( roadCoord );
	}

	createElevationAt ( roadCoord: TvRoadCoord ) {

		const elevation = roadCoord.road.getElevationAt( roadCoord.s ).clone( roadCoord.s );

		elevation.a = roadCoord.road.getElevationValue( roadCoord.s );

		return elevation;

	}

	add ( parent: TvRoad, object: TvElevation ): void {

		parent.addElevationInstance( object );

		TvUtils.computeCoefficients( parent.elevationProfile.elevation, parent.length );

		this.roadService.update( parent );

	}

	all ( parent: TvRoad ): TvElevation[] {

		return parent.elevationProfile.elevation;

	}

	remove ( road: TvRoad, elevation: TvElevation ): void {

		road.removeElevationInstance( elevation );

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		this.roadService.update( road );

	}

	update ( road: TvRoad, elevation: TvElevation ): void {

		TvUtils.computeCoefficients( road.elevationProfile.elevation, road.length );

		this.roadService.update( road );

	}

}
