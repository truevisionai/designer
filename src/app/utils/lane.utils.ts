/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "app/map/models/tv-lane";
import { TvRoad } from "app/map/models/tv-road.model";
import { TrafficRule } from "../map/models/traffic-rule";
import { TravelDirection, TvContactPoint, TvLaneSide, TvLaneType } from "../map/models/tv-common";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";

export class LaneUtils {

	private static readonly TYPE_ALIASES: Record<string, TvLaneType> = {
		walking: TvLaneType.sidewalk,
	};

	static typeToString ( type: TvLaneType ): string {
		return type in TvLaneType ? type : 'none';
	}

	static stringToType ( value: string ): TvLaneType {

		// Convert to lowercase for case-insensitive comparison
		const normalizedValue = value.toLowerCase();

		// Check direct matches first
		const enumValues = Object.values( TvLaneType ) as string[];
		if ( enumValues.includes( normalizedValue ) ) {
			return normalizedValue as TvLaneType;
		}

		// Check aliases
		if ( normalizedValue in LaneUtils.TYPE_ALIASES ) {
			return LaneUtils.TYPE_ALIASES[ normalizedValue ];
		}

		return TvLaneType.none;

	}

	/**
	 * @deprecated use road.getLaneProfile().getPreviousLaneSection()
	 * @param road
	 * @param laneSection
	 */
	static findPreviousLaneSection ( road: TvRoad, laneSection: TvLaneSection ): any {

		return road.getLaneProfile().getPreviousLaneSection( laneSection );

	}

	/**
	 * @deprecated use road.getLaneProfile().getNextLaneSection()
	 * @param road
	 * @param laneSection
	 */
	static findNextLaneSection ( road: TvRoad, laneSection: TvLaneSection ): any {

		return road.getLaneProfile().getNextLaneSection( laneSection );

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

	static findIncomingSide ( contact: TvContactPoint ): TvLaneSide {

		if ( contact == TvContactPoint.START ) {
			return TvLaneSide.LEFT;
		}

		return TvLaneSide.RIGHT;

	}

	static findOutgoingSide ( contact: TvContactPoint ): TvLaneSide {

		if ( contact == TvContactPoint.END ) {
			return TvLaneSide.LEFT;
		}

		return TvLaneSide.RIGHT;

	}

	// when we only have incoming lane
	static copyPreviousLane ( prevLane: TvLane, prevSection: TvLaneSection, prevRoad: TvRoad, lane: TvLane ): void {

		LaneUtils.copyPrevLaneWidth( prevLane, prevSection, prevRoad, lane );
		LaneUtils.copyPrevRoadMark( prevLane, prevSection, prevRoad, lane );

	}

	static copyPrevLaneWidth ( prevLane: TvLane, prevSection: TvLaneSection, prevRoad: TvRoad, lane: TvLane ): void {

		// const newSectionLength = lane.laneSection.road.length - lane.laneSection.s;

		const prevSectionLength = prevRoad.length - prevSection.s;

		const startWidth = prevLane.getWidthValue( prevSectionLength );

		lane.addWidthRecord( 0, startWidth, 0, 0, 0 );

	}

	static copyNextLaneWidth ( nextLane: TvLane, nextSection: TvLaneSection, nextRoad: TvRoad, lane: TvLane ): void {

		const newSectionLength = lane.laneSection.road.length - lane.laneSection.s;

		const width = nextLane.getWidthValue( 0 );

		lane.addWidthRecord( newSectionLength, width, 0, 0, 0 );

	}

	static copyPrevRoadMark ( prevLane: TvLane, prevSection: TvLaneSection, prevRoad: TvRoad, lane: TvLane ): void {

		const lastRoadMark = prevLane.roadMarks.getLast();

		if ( lastRoadMark ) {
			lane.addRoadMarkInstance( lastRoadMark.clone( 0, lane ) );
		}

	}

	static findOuterMostLane ( laneSection: TvLaneSection, side: TvLaneSide, type?: TvLaneType ): any {

		const lanes = laneSection.getLanes().filter( lane => lane.side == side && ( !type || lane.type == type ) );

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

	static findHigestLane ( laneSection: TvLaneSection, type?: TvLaneType ): any {

		const lanes = laneSection.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => !type || lane.type == type );

		return this.findHighest( lanes, type );
	}

	static findHighest ( lanes: TvLane[], type?: TvLaneType ): any {

		if ( lanes.length === 0 ) return null;

		let highestLaneId = Number.MIN_SAFE_INTEGER;
		let highestLane = null;

		for ( const current of lanes ) {

			// ignore center lanes
			if ( current.isCenter ) continue;

			if ( type && current.type != type ) continue;

			if ( current.id > highestLaneId ) {

				highestLane = current;
				highestLaneId = current.id;

			}

		}

		return highestLane;

	}

	static findLowestLane ( laneSection: TvLaneSection, type?: TvLaneType ): any {

		const lanes = laneSection.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => !type || lane.type == type );

		return this.findLowest( lanes, type );

	}

	static findLowestCarriageWayLane ( laneSection: TvLaneSection ): any {

		const lanes = laneSection.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => lane.isCarriageWay() );

		return this.findLowest( lanes );

	}

	static findHighestCarriageWayLane ( laneSection: TvLaneSection ): any {

		const lanes = laneSection.getLanes()
			.filter( lane => lane.id != 0 )
			.filter( lane => lane.isCarriageWay() );

		return this.findHighest( lanes );

	}

	static findLowest ( lanes: TvLane[], type?: TvLaneType ): any {

		if ( lanes.length === 0 ) return null;

		let lowestLaneId = Number.MAX_SAFE_INTEGER;
		let lowestLane = null;

		for ( const current of lanes ) {

			// ignore center lanes
			if ( current.isCenter ) continue;

			if ( type && current.type != type ) continue;

			if ( current.id < lowestLaneId ) {

				lowestLane = current;
				lowestLaneId = current.id;

			}

		}

		return lowestLane;

	}

	static canConnect ( left: TvLaneCoord, right: TvLaneCoord ): boolean {

		return left.canConnect( right );

	}
}
