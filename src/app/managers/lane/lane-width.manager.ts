/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvLaneSide, TvLaneType } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvUtils } from "app/map/models/tv-utils";
import { LaneUtils } from "app/utils/lane.utils";
import { Maths } from "app/utils/maths";

/**
 * LaneWidthManager
The width of the lane shall be defined for the full length of the lane section. This means that there must be a <width> element for @s="0".
The center lane shall have no width, meaning that the <width> element shall not be used for the center lane.
The width of a lane shall remain valid until a new <width> element is defined or the lane section ends.
A new <width> element shall be defined when the variables of the polynomial function change.
<width> elements shall not be used together with <border> elements in the same lane group.
<width> elements shall be defined in ascending order according to the s-coordinate.
Width (ds) shall be greater than or equal to zero.
 */

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthManager {

	onLaneUpdated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		this.validateLane( lane );

		return;

		this.syncWithPredecessor( road, laneSection, lane );

		this.syncWithSuccessor( road, laneSection, lane );

	}

	onLaneCreated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		this.validateLane( lane );

		return;

		this.syncWithPredecessor( road, laneSection, lane );

		this.syncWithSuccessor( road, laneSection, lane );

	}

	onLaneTypeChanged ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		return;

		this.validateLane( lane );

		this.syncWithPredecessor( road, laneSection, lane );

		this.syncWithSuccessor( road, laneSection, lane );

	}

	private syncWithSuccessor ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		if ( road.isJunction ) return;

		// if successor is not defined return
		if ( !lane.successorExists ) return;

		const nextLaneSection = road.getLaneProfile().getNextLaneSection( laneSection );

		if ( !nextLaneSection ) return

		// // for now return if lane section is not matching
		// if ( !nextLaneSection.isMatching( laneSection ) ) return;

		const succcessor = nextLaneSection.getLaneById( lane.successorId );

		const lastWidthNode = lane.getWidthArray()[ lane.getLaneWidthCount() - 1 ];

		if ( !lastWidthNode ) return;

		// smooth transition
		if ( succcessor.id != lane.id ) {

			let nextLaneWidth = succcessor.getWidthValue( 0 );

			// when widths are are different we want smooth transition

			if ( lastWidthNode.s != laneSection.getLength() ) {

				lane.addWidthRecord( laneSection.getLength() - 10, nextLaneWidth, 0, 0, 0 );
				lane.addWidthRecord( laneSection.getLength(), 0, 0, 0, 0 );

			} else {

				lane.addWidthRecord( laneSection.getLength() - 10, nextLaneWidth, 0, 0, 0 );
				lastWidthNode.a = 0;

			}

		} else {

			let nextLaneWidth = succcessor.getWidthValue( 0 );

			if ( lastWidthNode.s != laneSection.getLength() ) {

				lane.addWidthRecord( laneSection.getLength(), nextLaneWidth, 0, 0, 0 );

			} else {

				lastWidthNode.a = nextLaneWidth;

			}

		}

		lane.updateWidthCoefficients();
	}

	private syncWithPredecessor ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, targetWidth?: number ) {

		// TODO: Implement this method

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

	private validateLane ( lane: TvLane ) {

		this.ensureMinWidthRecord( lane );
		lane.sortWidth();
		lane.removeInvalidWidths();

	}

	private ensureMinWidthRecord ( lane: TvLane ) {

		if ( lane.side == TvLaneSide.CENTER ) {
			lane.clearLaneWidth();
			return;
		}


		if ( lane.getLaneWidthCount() == 0 ) {

			lane.addWidthRecord( 0, this.getWidthByType( lane.type ), 0, 0, 0 );

		} else {

			const firstWidth = lane.getWidthArray()[ 0 ];

			if ( firstWidth.s != 0 ) {

				lane.addWidthRecord( 0, firstWidth.a, firstWidth.b, firstWidth.c, firstWidth.d );

			}

		}

	}

}
