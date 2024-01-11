import { Injectable } from "@angular/core";
import { TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { ParkingRoadToolService } from "app/tools/parking/parking-road-tool.service";

@Injectable( {
	providedIn: 'root'
} )
export class ParkingLaneManager {

	constructor ( private parkingRoadToolService: ParkingRoadToolService ) { }

	onLaneTypeChanged ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( road, lane );
			this.parkingRoadToolService.addRepeatedParkingObject( road, lane );

		} else {

			this.parkingRoadToolService.removeRepeatedParkingObject( road, lane );

		}

	}

	onLaneRemoved ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( road, lane );

		}

	}

	onLaneCreated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( road, lane );
			this.parkingRoadToolService.addRepeatedParkingObject( road, lane );

		}

	}


}
