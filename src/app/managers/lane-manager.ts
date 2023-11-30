import { MapEvents, RoadUpdatedEvent } from "app/events/map-events";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { Manager } from "./manager";
import { LaneService } from "app/tools/lane/lane.service";

export class LaneManager extends Manager {

	private debug = true;

	constructor ( private laneService: LaneService ) {

		super();

	}

	init () {

		MapEvents.laneCreated.subscribe( e => this.onLaneCreated( e ) );
		MapEvents.laneRemoved.subscribe( e => this.onLaneRemoved( e ) );
		MapEvents.laneUpdated.subscribe( e => this.onLaneUpdated( e ) );

	}

	onLaneUpdated ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneUpdated', lane );

		this.laneService.onLaneUpdated( lane );

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
