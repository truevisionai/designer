import { MapEvents, RoadUpdatedEvent } from "app/events/map-events";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { Manager } from "./manager";

export class LaneManager extends Manager {

	private debug = true;

	constructor () {

		super();

	}

	init () {

		MapEvents.laneCreated.subscribe( e => this.onLaneCreated( e ) );
		MapEvents.laneRemoved.subscribe( e => this.onLaneRemoved( e ) );
		MapEvents.laneUpdated.subscribe( e => this.onLaneUpdated( e ) );

	}

	onLaneUpdated ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneUpdated', lane );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( lane.laneSection.road, false ) );

	}

	onLaneRemoved ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneRemoved', lane );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( lane.laneSection.road, false ) );

	}

	onLaneCreated ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneCreated', lane );

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( lane.laneSection.road, false ) );
	}

}
