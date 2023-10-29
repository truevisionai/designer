import { MapEvents } from "app/events/map-events";
import { TvMapBuilder } from "app/modules/tv-map/builders/tv-map-builder";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvMapInstance } from "app/modules/tv-map/services/tv-map-source-file";
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

		TvMapBuilder.rebuildRoad( lane.laneSection.road, false );

	}

	onLaneRemoved ( removedLane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneRemoved', removedLane );

		const lanes = [ ...removedLane.laneSection.laneMap.entries() ];

		removedLane.laneSection.laneMap.clear();

		// create a new map
		let newLaneMap = new Map<number, TvLane>();

		// iterate through the old map
		for ( let [ id, lane ] of lanes ) {

			// shift left lanes
			if ( id > removedLane.id && removedLane.id > 0 ) lane.setId( id - 1 );

			// shift right lanes
			if ( id < removedLane.id && removedLane.id < 0 ) lane.setId( id + 1 );

			newLaneMap.set( lane.id, lane );

		}

		removedLane.laneSection.laneMap = newLaneMap;

		TvMapBuilder.rebuildRoad( removedLane.laneSection.road, false );

	}

	onLaneCreated ( lane: TvLane ): void {

		if ( this.debug ) console.debug( 'onLaneCreated', lane );

		TvMapBuilder.rebuildRoad( lane.laneSection.road, false );

	}

}
