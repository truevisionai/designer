/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "app/map/models/tv-lane";
import { TvRoad } from "app/map/models/tv-road.model";
import { TrafficRule } from "../map/models/traffic-rule";
import { TravelDirection, TurnType, TvContactPoint, TvLaneSide, TvLaneType } from "../map/models/tv-common";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoadCoord } from "app/map/models/TvRoadCoord";
import { TvLink } from "app/map/models/tv-link";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { Maths } from "./maths";

export class LaneUtils {

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

		// getPredecessorLaneSection ( laneSection: TvLaneSection ) {

		// 	const index = this.laneSections.findIndex( ls => ls == laneSection );

		// 	if ( index > 0 ) return this.laneSections[ index - 1 ];

		// 	if ( !this.predecessor ) return;

		// 	return this.predecessor.laneSection;

		// }


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


		// getSuccessorLaneSection ( laneSection: TvLaneSection ): TvLaneSection {

		// 	const nextLaneSection = this.laneSections.find( ls => ls.s > laneSection.s );

		// 	if ( nextLaneSection ) return nextLaneSection;

		// 	if ( !this.successor ) return;

		// 	return this.successor.laneSection

		// }

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

	static findHigestLane ( laneSection: TvLaneSection, type?: TvLaneType ) {

		const lanes = laneSection.getLaneArray()
			.filter( lane => lane.id != 0 )
			.filter( lane => !type || lane.type == type );

		return this.findHighest( lanes, type );
	}

	static findHighest ( lanes: TvLane[], type?: TvLaneType ) {

		if ( lanes.length === 0 ) return null;

		let highestLaneId = Number.MIN_SAFE_INTEGER;
		let highestLane = null;

		for ( const current of lanes ) {

			// ignore center lanes
			if ( current.side == TvLaneSide.CENTER ) continue;

			if ( type && current.type != type ) continue;

			if ( current.id > highestLaneId ) {

				highestLane = current;
				highestLaneId = current.id;

			}

		}

		return highestLane;

	}

	static findLowestLane ( laneSection: TvLaneSection, type?: TvLaneType ) {

		const lanes = laneSection.getLaneArray()
			.filter( lane => lane.id != 0 )
			.filter( lane => !type || lane.type == type );

		return this.findLowest( lanes, type );

	}

	static findLowestCarriageWayLane ( laneSection: TvLaneSection ) {

		const lanes = laneSection.getLaneArray()
			.filter( lane => lane.id != 0 )
			.filter( lane => lane.isCarriageWay() );

		return this.findLowest( lanes );

	}

	static findHighestCarriageWayLane ( laneSection: TvLaneSection ) {

		const lanes = laneSection.getLaneArray()
			.filter( lane => lane.id != 0 )
			.filter( lane => lane.isCarriageWay() );

		return this.findHighest( lanes );

	}

	static findLowest ( lanes: TvLane[], type?: TvLaneType ) {

		if ( lanes.length === 0 ) return null;

		let lowestLaneId = Number.MAX_SAFE_INTEGER;
		let lowestLane = null;

		for ( const current of lanes ) {

			// ignore center lanes
			if ( current.side == TvLaneSide.CENTER ) continue;

			if ( type && current.type != type ) continue;

			if ( current.id < lowestLaneId ) {

				lowestLane = current;
				lowestLaneId = current.id;

			}

		}

		return lowestLane;

	}

	static isEntry ( lane: TvLane, contact: TvContactPoint ): boolean {

		return ( lane.direction === TravelDirection.forward && contact === TvContactPoint.END ) ||
			( lane.direction === TravelDirection.backward && contact === TvContactPoint.START );

	}


	static isExit ( lane: TvLane, contact: TvContactPoint ): boolean {

		return ( lane.direction === TravelDirection.forward && contact === TvContactPoint.START ) ||
			( lane.direction === TravelDirection.backward && contact === TvContactPoint.END );

	}

	static canConnect ( left: TvLaneCoord, right: TvLaneCoord ): boolean {

		if ( left.road.id === right.road.id ) return false;

		if ( left.lane.type !== right.lane.type ) return false;

		// don't merge if both are entries
		if ( this.isEntry( left.lane, left.contact ) && this.isEntry( right.lane, right.contact ) ) return false;

		// don't merge if both are exits
		if ( this.isExit( left.lane, left.contact ) && this.isExit( right.lane, right.contact ) ) return false;

		return true;
	}
}
