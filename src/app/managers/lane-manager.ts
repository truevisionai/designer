import { Injectable } from "@angular/core";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvUtils } from "app/modules/tv-map/models/tv-utils";
import { MapService } from "app/services/map.service";
import { RoadLinkService } from "app/services/road/road-link.service";
import { RoadService } from "app/services/road/road.service";
import { ParkingRoadToolService } from "app/tools/parking/parking-road-tool.service";

@Injectable( {
	providedIn: 'root'
} )
export class LaneManager {

	constructor (
		private parkingRoadToolService: ParkingRoadToolService,
	) { }

	onLaneCreated ( lane: TvLane ) {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( lane.laneSection.road, lane );
			this.parkingRoadToolService.addRepeatedParkingObject( lane.laneSection.road, lane );

		}

		this.updateLaneLinks( lane );

	}

	onLaneRemoved ( lane: TvLane ) {

		if ( lane.type == TvLaneType.parking ) {

			this.parkingRoadToolService.removeRepeatedParkingObject( lane.laneSection.road, lane );

		}

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

	private updateLaneLinks ( lane: TvLane ) {

		// TODO: Will add after testing
		return;

		const road = lane.laneSection.road;

		const previousLaneSection = this.previousLaneSection( lane );
		const currentLaneSection = lane.laneSection;
		const nextLaneSection = this.nextLaneSection( lane );

		const ds = Math.min( currentLaneSection.length * 0.2, 16 );

		if ( previousLaneSection.lanes.size != currentLaneSection.lanes.size ) {

			const width = lane.getWidthValue( 0 );

			// remove first width record at s=0 if exists
			if ( lane.width.length > 0 && lane.width[ 0 ].s == 0 ) {
				lane.width.splice( 0, 1 );
			}

			lane.addWidthRecord( 0, 0, 0, 0, 0 );
			lane.addWidthRecord( ds, width, 0, 0, 0 );

			TvUtils.computeCoefficients( lane.width, currentLaneSection.length );

		}

		if ( nextLaneSection.lanes.size != currentLaneSection.lanes.size ) {

			const width = lane.getWidthValue( currentLaneSection.length );

			// remove last width record at s=lane.length if exists
			if ( lane.width.length > 0 && lane.width[ lane.width.length - 1 ].s == currentLaneSection.length ) {
				lane.width.splice( lane.width.length - 1, 1 );
			}

			lane.addWidthRecord( currentLaneSection.length - ds, width, 0, 0, 0 );
			lane.addWidthRecord( currentLaneSection.length, 0, 0, 0, 0 );

			TvUtils.computeCoefficients( lane.width, currentLaneSection.length );

		}

	}

	private previousLaneSection ( lane: TvLane ): TvLaneSection {

		return lane.laneSection.road.getPredecessorLaneSection( lane.laneSection );

	}

	private nextLaneSection ( lane: TvLane ): TvLaneSection {

		return lane.laneSection.road.getSuccessorLaneSection( lane.laneSection );

	}
}
