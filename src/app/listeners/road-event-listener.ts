/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MapEvents } from "../events/map-events";
import { Injectable } from "@angular/core";
import { RoadCreatedEvent } from "../events/road/road-created-event";
import { RoadUpdatedEvent } from "../events/road/road-updated-event";
import { RoadRemovedEvent } from "../events/road/road-removed-event";
import { RoadManager } from "app/managers/road/road-manager";

@Injectable( {
	providedIn: 'root'
} )
export class RoadEventListener {

	constructor (
		private roadManager: RoadManager,
	) {
	}

	init (): void {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );

	}

	onRoadCreated ( event: RoadCreatedEvent ): void {

		this.roadManager.addRoad( event.road );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ): void {

		if ( event.road.spline.getControlPointCount() < 2 ) return;

		this.roadManager.updateRoad( event.road );

	}

	onRoadRemoved ( event: RoadRemovedEvent ): void {

		this.roadManager.removeRoad( event.road );

	}

}
