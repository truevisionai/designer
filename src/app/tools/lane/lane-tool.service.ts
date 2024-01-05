import { Injectable } from '@angular/core';
import { LaneDebugService } from 'app/services/debug/lane-debug.service';
import { RoadDebugService } from 'app/services/debug/road-debug.service';
import { BaseToolService } from '../base-tool.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { MapEvents } from 'app/events/map-events';

@Injectable( {
	providedIn: 'root'
} )
export class LaneToolService {

	constructor (
		public base: BaseToolService,
		public laneDebug: LaneDebugService,
		public roadDebug: RoadDebugService,
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
