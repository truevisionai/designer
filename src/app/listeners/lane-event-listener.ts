import { MapEvents } from "app/events/map-events";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { RoadUpdatedEvent } from "../events/road/road-updated-event";
import { Injectable } from "@angular/core";
import { Environment } from "app/core/utils/environment";
import { LaneManager } from "app/managers/lane-manager";

@Injectable( {
	providedIn: 'root'
} )
export class LaneEventListener {

	private debug = !Environment.production;

	constructor (
		private laneManager: LaneManager,
	) {
	}

	init () {

		MapEvents.laneCreated.subscribe( e => this.onLaneCreated( e ) );
		MapEvents.laneRemoved.subscribe( e => this.onLaneRemoved( e ) );
		MapEvents.laneUpdated.subscribe( e => this.onLaneUpdated( e ) );

	}

	onLaneUpdated ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneUpdated', lane );

		this.laneManager.onLaneUpdated( lane );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( lane.laneSection.road, false ) );

	}

	onLaneRemoved ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneRemoved', lane );

		this.laneManager.onLaneRemoved( lane );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( lane.laneSection.road, false ) );

	}

	onLaneCreated ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneCreated', lane );

		this.laneManager.onLaneCreated( lane );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( lane.laneSection.road, false ) );
	}

}
