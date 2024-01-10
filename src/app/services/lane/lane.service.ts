import { Injectable } from '@angular/core';
import { BaseToolService } from '../../tools/base-tool.service';
import { LaneDebugService } from '../debug/lane-debug.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneType } from 'app/modules/tv-map/models/tv-common';
import { ParkingRoadToolService } from '../../tools/parking/parking-road-tool.service';
import { RoadDebugService } from 'app/services/debug/road-debug.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneService {

	constructor (
		public base: BaseToolService,
		public laneDebug: LaneDebugService,
		private parkingRoadToolService: ParkingRoadToolService,
		public roadDebug: RoadDebugService,
	) { }

	addLane ( lane: TvLane ) {

		lane.laneSection.addLaneInstance( lane, true );

	}

	removeLane ( lane: TvLane ) {

		lane.laneSection.removeLane( lane );

	}

}
