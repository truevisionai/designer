/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents } from "../events/map-events";
import { Injectable } from "@angular/core";
import { SplineCreatedEvent } from "../events/spline/spline-created-event";
import { SplineUpdatedEvent } from "../events/spline/spline-updated-event";
import { SplineRemovedEvent } from "../events/spline/spline-removed-event";
import { SplineManager } from "app/managers/spline-manager";

@Injectable( {
	providedIn: 'root'
} )
export class SplineEventListener {

	private debug: boolean = false;

	constructor (
		private splineManager: SplineManager,
	) {
	}

	init () {

		MapEvents.splineCreated.subscribe( e => this.onSplineCreated( e ) );
		MapEvents.splineRemoved.subscribe( e => this.onSplineRemoved( e ) );
		MapEvents.splineUpdated.subscribe( e => this.onSplineUpdated( e ) );

	}

	onSplineCreated ( event: SplineCreatedEvent ) {

		this.splineManager.createSpline( event.spline );

	}

	onSplineRemoved ( event: SplineRemovedEvent ) {

		this.splineManager.removeSpline( event.spline );

	}

	onSplineUpdated ( event: SplineUpdatedEvent ) {

		this.splineManager.updateSpline( event.spline );

	}

}
