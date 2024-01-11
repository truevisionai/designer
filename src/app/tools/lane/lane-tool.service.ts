import { Injectable } from '@angular/core';
import { LaneDebugService } from 'app/services/debug/lane-debug.service';
import { RoadDebugService } from 'app/services/debug/road-debug.service';
import { BaseToolService } from '../base-tool.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { MapEvents } from 'app/events/map-events';
import { LaneService } from 'app/services/lane/lane.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneToolService {

	constructor (
		public base: BaseToolService,
		public laneDebug: LaneDebugService,
		public roadDebug: RoadDebugService,
		public laneService: LaneService,
	) { }

	addLane ( lane: TvLane ) {

		this.laneService.addLane( lane );

	}

	removeLane ( lane: TvLane ) {

		this.laneService.removeLane( lane );

	}

	updateLane ( lane: TvLane ) {

		this.laneService.updateLane( lane );

		this.laneDebug.unselectLane( lane );

		this.laneDebug.selectLane( lane );

	}

}
