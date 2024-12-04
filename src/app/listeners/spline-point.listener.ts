/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	MapEvents
} from "../events/map-events";
import { Injectable } from "@angular/core";
import { SceneService } from "../services/scene.service";
import { RoadUpdatedEvent } from "../events/road/road-updated-event";
import { ControlPointCreatedEvent } from "../events/control-point-created-event";
import { ControlPointUpdatedEvent } from "../events/control-point-updated-event";
import { ControlPointRemovedEvent } from "../events/control-point-removed-event";
import { SplineUpdatedEvent } from "../events/spline/spline-updated-event";

@Injectable( {
	providedIn: 'root'
} )
export class SplinePointListener {

	constructor () {

	}

	init (): void {

		MapEvents.controlPointCreated.subscribe( e => this.onRoadControlPointCreated( e ) );
		MapEvents.controlPointRemoved.subscribe( e => this.onRoadControlPointRemoved( e ) );
		MapEvents.controlPointUpdated.subscribe( e => this.onRoadControlPointUpdated( e ) );

	}

	onRoadControlPointCreated ( event: ControlPointCreatedEvent ): void {

		SceneService.addToolObject( event.controlPoint );

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( event.controlPoint.spline ) );

	}

	onRoadControlPointUpdated ( event: ControlPointUpdatedEvent ): void {

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( event.controlPoint.spline ) );

	}

	onRoadControlPointRemoved ( event: ControlPointRemovedEvent ): void {

		SceneService.removeFromTool( event.controlPoint );

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( event.controlPoint.spline ) );

	}


}
