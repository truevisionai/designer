/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseController } from "app/core/controllers/base-controller";
import { AutoSpline } from "app/core/shapes/auto-spline-v2";
import { SplineService } from "app/services/spline/spline.service";

@Injectable( {
	providedIn: 'root'
} )
export abstract class SplineController extends BaseController<AutoSpline> {

	constructor (
		private splineService: SplineService
	) {
		super();
	}

	onAdded ( object: AutoSpline ): void {

		this.splineService.add( object );

	}

	onUpdated ( object: AutoSpline ): void {

		this.splineService.updateSpline( object );

	}

	onRemoved ( object: AutoSpline ): void {

		this.splineService.remove( object );

	}

}

