import { MapEvents } from "../events/map-events";
import { Injectable } from "@angular/core";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { JunctionService } from "app/services/junction/junction.service";
import { RoadCreatedEvent } from "../events/road/road-created-event";
import { RoadUpdatedEvent } from "../events/road/road-updated-event";
import { RoadRemovedEvent } from "../events/road/road-removed-event";
import { RoadManager } from "app/managers/road-manager";

@Injectable( {
	providedIn: 'root'
} )
export class RoadEventListener {

	constructor (
		private junctionService: JunctionService,
		private roadManager: RoadManager,
	) {
	}

	init () {

		MapEvents.roadCreated.subscribe( e => this.onRoadCreated( e ) );
		MapEvents.roadRemoved.subscribe( e => this.onRoadRemoved( e ) );
		MapEvents.roadUpdated.subscribe( e => this.onRoadUpdated( e ) );

	}

	onRoadCreated ( event: RoadCreatedEvent ) {

		this.roadManager.addRoad( event.road );

	}

	onRoadUpdated ( event: RoadUpdatedEvent ) {

		if ( event.road.spline.controlPoints.length < 2 ) return;

		this.roadManager.updateRoad( event.road );

		this.updateJunction( event.road );

	}

	onRoadRemoved ( event: RoadRemovedEvent ) {

		this.roadManager.removeRoad( event.road );

	}

	updateJunction ( road: TvRoad ) {

		if ( !road.isJunction ) return;

		road.junctionInstance.boundingBox = this.junctionService.computeBoundingBox( road.junctionInstance );

	}

}
