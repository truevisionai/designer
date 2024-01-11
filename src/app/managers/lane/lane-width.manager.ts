import { Injectable } from "@angular/core";
import { TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvLaneSection } from "app/modules/tv-map/models/tv-lane-section";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { TvUtils } from "app/modules/tv-map/models/tv-utils";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthManager {

	onLaneTypeChanged ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		lane.width.splice( 0, lane.width.length );

		const targetWidth = this.getWidthByType( lane.type );

		this.updateLaneWidth( road, laneSection, lane, targetWidth );

	}

	updateLaneWidth ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, targetWidth?: number ) {

		this.syncWithPredecessor( road, laneSection, lane, targetWidth );

		this.syncWithSuccessor( road, laneSection, lane, targetWidth );

	}

	private syncWithSuccessor ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, targetWidth: number ) {

		const currentLaneSection = lane.laneSection;
		const nextLaneSection = this.nextLaneSection( lane );
		const ds = Math.min( currentLaneSection.length * 0.2, 16 );

		if ( nextLaneSection && !nextLaneSection.isMatching( currentLaneSection ) ) {

			let width: number;

			if ( targetWidth ) {

				width = targetWidth;

			} else if ( lane.width.length > 0 ) {

				width = lane.getWidthValue( currentLaneSection.length );

			} else {

				width = this.getWidthByType( lane.type );

			}

			// remove last width record at s=lane.length if exists
			if ( lane.width.length > 0 && lane.width[ lane.width.length - 1 ].s == currentLaneSection.length ) {
				lane.width.splice( lane.width.length - 1, 1 );
			}

			// lane.addWidthRecord( currentLaneSection.length - ds, width, 0, 0, 0 );
			lane.addWidthRecord( currentLaneSection.length, width, 0, 0, 0 );

			TvUtils.computeCoefficients( lane.width, currentLaneSection.length );

		}

		if ( lane.width.length == 0 ) {

			lane.addWidthRecord( 0, targetWidth || this.getWidthByType( lane.type ), 0, 0, 0 );

		}

	}

	private syncWithPredecessor ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, targetWidth: number ) {

		const previousLaneSection = this.previousLaneSection( lane );
		const currentLaneSection = lane.laneSection;
		const ds = Math.min( currentLaneSection.length * 0.2, 16 );

		if ( previousLaneSection && !previousLaneSection.isMatching( currentLaneSection ) ) {

			let width: number;

			if ( targetWidth ) {

				width = targetWidth;

			} else if ( lane.width.length > 0 ) {

				width = lane.getWidthValue( 0 );

			} else {

				width = this.getWidthByType( lane.type );

			}

			// remove first width record at s=0 if exists
			if ( lane.width.length > 0 && lane.width[ 0 ].s == 0 ) {
				lane.width.splice( 0, 1 );
			}

			lane.addWidthRecord( 0, width, 0, 0, 0 );
			// lane.addWidthRecord( ds, width, 0, 0, 0 );

			TvUtils.computeCoefficients( lane.width, currentLaneSection.length );

		}
	}

	private previousLaneSection ( lane: TvLane ): TvLaneSection {

		return lane.laneSection.road.getPredecessorLaneSection( lane.laneSection );

	}

	private nextLaneSection ( lane: TvLane ): TvLaneSection {

		return lane.laneSection.road.getSuccessorLaneSection( lane.laneSection );

	}

	private getWidthByType ( type: TvLaneType ): number {

		switch ( type ) {

			case TvLaneType.driving: return 3.6;

			case TvLaneType.parking: return 5.5;

			case TvLaneType.sidewalk: return 2.0;

			case TvLaneType.stop: return 2.0;

			case TvLaneType.shoulder: return 0.5;

			case TvLaneType.biking: return 2.0;

			case TvLaneType.border: return 0.5;

			case TvLaneType.median: return 1.0;

			case TvLaneType.curb: return 1.0;

			default: return 3.6;

		}

	}
}
