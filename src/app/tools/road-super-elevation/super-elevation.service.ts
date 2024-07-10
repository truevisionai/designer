/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "../../map/models/tv-road.model";
import { TvSuperElevation } from "../../map/models/tv-lateral.profile";
import { RoadService } from "app/services/road/road.service";

@Injectable( {
	providedIn: 'root'
} )
export class SuperElevationService {

	constructor (
		private roadService: RoadService
	) {
	}

	add ( road: TvRoad, superElevation: TvSuperElevation ) {

		road.lateralProfile.superElevations.set( superElevation.s, superElevation );

		road.lateralProfile.superElevations.computeCoefficients( road.length );

		this.roadService.update( road );

	}

	update ( road: TvRoad, superElevation: TvSuperElevation ) {

		road.lateralProfile.superElevations.computeCoefficients( road.length );

		this.roadService.update( road );

	}

	remove ( road: TvRoad, superElevation: TvSuperElevation ) {

		road.lateralProfile.superElevations.remove( superElevation );

		road.lateralProfile.superElevations.computeCoefficients( road.length );

		this.roadService.update( road );

	}
}
