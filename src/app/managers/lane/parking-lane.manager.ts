/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvLaneType } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";
import { ParkingRoadToolService } from "app/tools/parking/parking-road-tool.service";

@Injectable( {
	providedIn: 'root'
} )
export class ParkingLaneManager {

	constructor ( private parkingRoadToolService: ParkingRoadToolService ) { }

	onLaneTypeChanged ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): void {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( road, lane );
			this.parkingRoadToolService.addRepeatedParkingObject( road, lane );

		} else {

			this.parkingRoadToolService.removeRepeatedParkingObject( road, lane );

		}

	}

	onLaneRemoved ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): void {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( road, lane );

		}

	}

	onLaneCreated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): void {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( road, lane );
			this.parkingRoadToolService.addRepeatedParkingObject( road, lane );

		}

	}


}
