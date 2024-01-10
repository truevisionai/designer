import { Injectable } from '@angular/core';
import { BaseToolService } from '../../tools/base-tool.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { MapEvents } from 'app/events/map-events';

@Injectable( {
	providedIn: 'root'
} )
export class LaneService {

	constructor (
		public base: BaseToolService,
	) { }

	addLane ( lane: TvLane ) {

		lane.laneSection.addLaneInstance( lane, true );

		MapEvents.laneCreated.emit( lane );

	}

	removeLane ( lane: TvLane ) {

		lane.laneSection.removeLane( lane );

		MapEvents.laneRemoved.emit( lane );

	}

	updateLane ( lane: TvLane ) {

		MapEvents.laneUpdated.emit( lane );

	}


}
