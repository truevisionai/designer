import { MapEvents } from "app/events/map-events";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { Manager } from "./manager";

export class LaneManager extends Manager {

	private static _instance = new LaneManager();
	private debug = true;

	static get instance (): LaneManager {
		return this._instance;
	}

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

	}

	onLaneRemoved ( removedLane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneRemoved', removedLane );

	}

	onLaneCreated ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneCreated', lane );

	}

}
