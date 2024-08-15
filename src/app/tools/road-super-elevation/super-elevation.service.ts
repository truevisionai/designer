/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "../../map/models/tv-road.model";
import { TvSuperElevation } from "../../map/models/tv-lateral.profile";
import { RoadService } from "app/services/road/road.service";
import { Log } from "app/core/utils/log";

@Injectable( {
	providedIn: 'root'
} )
export class SuperElevationService {

	constructor (
		private roadService: RoadService
	) {
	}

	validate ( road: TvRoad, superElevation: TvSuperElevation ): boolean {

		if ( superElevation.s < 0 ) {
			superElevation.s = 0;
			Log.warn( 'SuperElevationService', 'Super Elevation s value is less than 0. Setting s to 0' );
		}

		if ( superElevation.s > road.length ) {
			superElevation.s = road.length;
			Log.warn( 'SuperElevationService', 'Super Elevation s value is greater than road length. Setting s to road length' );
		}

		return true;
	}

	add ( road: TvRoad, superElevation: TvSuperElevation ) {

		this.validate( road, superElevation );

		road.getLateralProfile().addSuperElevation( superElevation );

		road.getLateralProfile().computeCoefficients( road.length );

		this.roadService.update( road );

	}

	update ( road: TvRoad, superElevation: TvSuperElevation ) {

		this.validate( road, superElevation );

		road.getLateralProfile().computeCoefficients( road.length );

		this.roadService.update( road );

	}

	remove ( road: TvRoad, superElevation: TvSuperElevation ) {

		road.getLateralProfile().removeSuperElevation( superElevation );

		road.getLateralProfile().computeCoefficients( road.length );

		this.roadService.update( road );

	}
}
