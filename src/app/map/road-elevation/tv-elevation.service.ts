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
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class TvElevationService extends LinkedDataService<TvRoad, TvElevation> {

	constructor (
		roadService: RoadService
	) {
		super();

		this.parentService = roadService;
	}

	validate ( road: TvRoad, elevation: TvElevation ): boolean {

		if ( elevation.s < 0 ) {
			elevation.s = 0;
			Log.warn( 'TvElevationService', 'Elevation s value is less than 0. Setting s to 0' );
		}

		if ( elevation.s > road.length ) {
			elevation.s = road.length;
			Log.warn( 'TvElevationService', 'Elevation s value is greater than road length. Setting s to road length' );
		}

		return true;
	}

	createElevation ( road: TvRoad, point: Vector3 ) {

		const roadCoord = road.getPosThetaByPosition( point ).toRoadCoord( road );

		return this.createElevationAt( roadCoord );
	}

	createElevationAt ( roadCoord: TvRoadCoord ) {

		const elevation = roadCoord.road.getElevationProfile().getElevationAt( roadCoord.s ).clone( roadCoord.s );

		elevation.a = roadCoord.road.getElevationProfile().getElevationValue( roadCoord.s );

		return elevation;

	}

	add ( road: TvRoad, object: TvElevation ): void {

		this.validate( road, object );

		road.getElevationProfile().addElevationInstance( object );

		TvUtils.computeCoefficients( road.getElevationProfile().getElevations(), road.length );

		this.parentService.update( road );

	}

	all ( parent: TvRoad ): TvElevation[] {

		return parent.getElevationProfile().getElevations();

	}

	remove ( road: TvRoad, elevation: TvElevation ): void {

		road.getElevationProfile().removeElevationInstance( elevation );

		TvUtils.computeCoefficients( road.getElevationProfile().getElevations(), road.length );

		this.parentService.update( road );

	}

	update ( road: TvRoad, elevation: TvElevation ): void {

		this.validate( road, elevation );

		TvUtils.computeCoefficients( road.getElevationProfile().getElevations(), road.length );

		this.parentService.update( road );

	}

}
