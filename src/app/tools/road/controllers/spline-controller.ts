/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseController } from "app/core/controllers/base-controller";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SplineService } from "app/services/spline/spline.service";

@Injectable( {
	providedIn: 'root'
} )
export abstract class SplineController<T extends AbstractSpline> extends BaseController<T> {

	constructor (
		private splineService: SplineService
	) {
		super();
	}

	onAdded ( object: T ): void {

		this.splineService.add( object );

	}

	onUpdated ( object: T ): void {

		this.splineService.updateSpline( object );

	}

	onRemoved ( object: T ): void {

		this.splineService.remove( object );

	}

}

