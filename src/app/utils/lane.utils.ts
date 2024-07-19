/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "app/map/models/tv-lane";
import { TvRoad } from "app/map/models/tv-road.model";
import { TrafficRule } from "../map/models/traffic-rule";
import { TravelDirection, TvContactPoint, TvLaneSide, TvLaneType } from "../map/models/tv-common";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";

export class LaneUtils {

	static findSuccessorLane ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): TvLane | null {

		// if no successor id is provided, then consider lane id as successor id
		const successorId = lane.successorId || lane.id;

		const nextLaneSection = LaneUtils.findNextLaneSection( road, laneSection );

		if ( !nextLaneSection ) return;

		return nextLaneSection.getLaneById( successorId );

	}

	static findPredecessorLane ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): TvLane | null {

		// if no predecessor id is provided, then consider lane id as predecessor id
		const predecessorId = lane.predecessorId || lane.id;

		const prevLaneSection = LaneUtils.findPreviousLaneSection( road, laneSection );

		if ( !prevLaneSection ) return;

		return prevLaneSection.getLaneById( predecessorId );

	}

	static findPreviousLaneSection ( road: TvRoad, laneSection: TvLaneSection ) {

		const index = road.laneSections.indexOf( laneSection );

		if ( index === 0 ) {

			if ( !road.predecessor ) return null;

			if ( !road.predecessor.isRoad ) return null;

			const predecessorRoad = road.predecessor.element as TvRoad;

			if ( road.predecessor.contactPoint == TvContactPoint.START ) {

				return predecessorRoad.laneSections[ 0 ];

			} else {

				return predecessorRoad.laneSections[ predecessorRoad.laneSections.length - 1 ];

			}

		}

		return road.laneSections[ index - 1 ];

	}

	static findNextLaneSection ( road: TvRoad, laneSection: TvLaneSection ) {

		const index = road.laneSections.indexOf( laneSection );

		if ( index === road.laneSections.length - 1 ) {

			if ( !road.successor ) return null;

			if ( !road.successor.isRoad ) return null;

			const successorRoad = road.successor.element as TvRoad;

			if ( road.successor.contactPoint == TvContactPoint.START ) {

				return successorRoad.laneSections[ 0 ];

			} else {

				return successorRoad.laneSections[ successorRoad.laneSections.length - 1 ];

			}

		}

		return road.laneSections[ index + 1 ];

	}

	static getNextLaneSection ( road: TvRoad, laneSection: TvLaneSection ): TvLaneSection | null {

		const index = road.laneSections.indexOf( laneSection );

		if ( index == road.laneSections.length - 1 ) {

			return null;

		}

		return road.laneSections[ index + 1 ];

	}

	static inRoadDirection ( road: TvRoad, lane: TvLane ): boolean {

		if ( road.trafficRule == TrafficRule.RHT ) {

			return lane.side === TvLaneSide.RIGHT;

		} else if ( road.trafficRule == TrafficRule.LHT ) {

			return lane.side === TvLaneSide.LEFT;

		} else {

			return false;

		}

	}

	// Method to determine the outgoing direction, needs to be implemented
	static determineDirection ( contact: TvContactPoint ): TravelDirection {

		if ( contact == TvContactPoint.END ) {
			return TravelDirection.forward;
		}

		return TravelDirection.backward;
	}

	static determineOutDirection ( contact: TvContactPoint ): TravelDirection {

		if ( contact == TvContactPoint.START ) {
			return TravelDirection.forward;
		}

		return TravelDirection.backward;
	}

	static determineOutgoingDirection ( incoming: TvRoadCoord, outgoing: TvRoadCoord ): TravelDirection {

		if ( incoming.contact != outgoing.contact ) {

			return incoming.travelDirection;

		}

		if ( incoming.travelDirection === TravelDirection.forward ) {

			return TravelDirection.backward;

		}

		return TravelDirection.forward;

	}

	// when we only have incoming lane
	static copyPreviousLane ( prevLane: TvLane, prevSection: TvLaneSection, prevRoad: TvRoad, lane: TvLane ) {

		LaneUtils.copyPrevLaneWidth( prevLane, prevSection, prevRoad, lane );
		LaneUtils.copyPrevRoadMark( prevLane, prevSection, prevRoad, lane );

	}

	static copyPrevLaneWidth ( prevLane: TvLane, prevSection: TvLaneSection, prevRoad: TvRoad, lane: TvLane ) {

		// const newSectionLength = lane.laneSection.road.length - lane.laneSection.s;

		const prevSectionLength = prevRoad.length - prevSection.s;

		const startWidth = prevLane.getWidthValue( prevSectionLength );

		lane.addWidthRecord( 0, startWidth, 0, 0, 0 );

	}

	static copyNextLaneWidth ( nextLane: TvLane, nextSection: TvLaneSection, nextRoad: TvRoad, lane: TvLane ) {

		const newSectionLength = lane.laneSection.road.length - lane.laneSection.s;

		const width = nextLane.getWidthValue( 0 );

		lane.addWidthRecord( newSectionLength, width, 0, 0, 0 );

	}

	static copyPrevRoadMark ( prevLane: TvLane, prevSection: TvLaneSection, prevRoad: TvRoad, lane: TvLane ) {

		const lastRoadMark = prevLane.roadMarks.getLast();

		if ( lastRoadMark ) {
			lane.addRoadMarkInstance( lastRoadMark.clone( 0, lane ) );
		}

	}

	static findOuterMostLane ( laneSection: TvLaneSection, side: TvLaneSide, type?: TvLaneType ) {

		const lanes = laneSection.getLaneArray().filter( lane => lane.side == side && ( !type || lane.type == type ) );

		if ( lanes.length === 0 ) return null;

		let outerMostLaneId = side === TvLaneSide.RIGHT ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
		let outerMostLane = null;

		for ( const current of lanes ) {

			if ( side === TvLaneSide.LEFT && current.id > outerMostLaneId ) {

				outerMostLane = current;
				outerMostLaneId = current.id;

			} else if ( side === TvLaneSide.RIGHT && current.id < outerMostLaneId ) {

				outerMostLane = current;
				outerMostLaneId = current.id;

			}

		}

		return outerMostLane;
	}

	static findOuterMostDrivingLane ( laneSection: TvLaneSection, side: TvLaneSide ) {

		return this.findOuterMostLane( laneSection, side, TvLaneType.driving );

	}

	static findOuterMostDrivingConnection ( laneSection: TvLaneSection, side: TvLaneSide ) {

		return this.findOuterMostLane( laneSection, side, TvLaneType.driving );

	}

}
