import { TvContactPoint } from "../models/tv-common";
import { TvLane } from "../models/tv-lane";
import { TvRoad } from "../models/tv-road.model";

// Creating types with "branding" to differentiate between road and lane distances
export type RoadDistance = number & { __brand: 'RoadDistance' };
export type LaneDistance = number & { __brand: 'LaneDistance' };

export function parseRoadDistance ( value: string ): RoadDistance | TvContactPoint {

	if ( value === 'start' ) {
		return TvContactPoint.START;
	}

	if ( value === 'end' ) {
		return TvContactPoint.END;
	}

	return parseFloat( value ) as RoadDistance;
}

export function createRoadDistance ( road: TvRoad, value: number | TvContactPoint ): RoadDistance {

	if ( typeof value === 'number' ) {
		return value as RoadDistance;
	}

	if ( value == TvContactPoint.START ) {
		return 0 as RoadDistance;
	}

	return road.getLength() as RoadDistance;
}

export function createLaneDistance ( lane: TvLane, value: number | TvContactPoint ): LaneDistance {

	if ( typeof value === 'number' ) {
		return value as LaneDistance;
	}

	if ( value == TvContactPoint.START ) {
		return 0 as LaneDistance;
	}

	return lane.laneSection.getLength() as LaneDistance;

}
