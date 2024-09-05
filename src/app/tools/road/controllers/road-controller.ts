/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/controllers/empty-controller";
import { TvRoad } from "app/map/models/tv-road.model";
import { SplineService } from "app/services/spline/spline.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadController extends EmptyController<TvRoad> {

	constructor ( private splineService: SplineService ) {

		super();

	}

	onUpdated ( object: TvRoad ): void {

		this.splineService.updateSpline( object.spline );

	}

}

