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

	updateLane ( lane: TvLane ) {

		// MapEvents.laneUpdated.emit( lane );

	}

	onLaneUpdated ( lane: TvLane ) {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( lane.laneSection.road, lane );
			this.parkingRoadToolService.addRepeatedParkingObject( lane.laneSection.road, lane );

		} else {

			this.parkingRoadToolService.removeRepeatedParkingObject( lane.laneSection.road, lane );

		}

		if ( lane.type == TvLaneType.sidewalk || lane.type == TvLaneType.curb ) {

			if ( lane.getLaneHeightCount() == 0 ) {

				lane.addHeightRecord( 0, 0.12, 0.12 );

			}

		} else {

			if ( lane.getLaneHeightCount() == 1 && lane.getLaneHeight( 0 ).sOffset == 0 ) {

				lane.clearLaneHeight();

			}

		}

	}

}
