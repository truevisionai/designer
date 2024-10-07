import { TvContactPoint } from "../models/tv-common";
import { TvRoad } from "../models/tv-road.model";

export abstract class Distance {

	abstract getValue (): number;

	static createRoad ( road: TvRoad, value: number | TvContactPoint ): RoadDistance {

		return createRoadDistance( road, value );

	}

}



// Creating types with "branding" to differentiate between road and lane distances
export type RoadDistance = number & { __brand: 'RoadDistance' };
export type LaneDistance = number & { __brand: 'LaneDistance' };

// Function to create road distances
export function createRoadDistance ( road: TvRoad, value: number | TvContactPoint ): RoadDistance {

	if ( typeof value === 'number' ) {
		return value as RoadDistance;
	}

	if ( value == TvContactPoint.START ) {
		return 0 as RoadDistance;
	}

	return road.getLength() as RoadDistance;
}

// Function to create lane distances
export function createLaneDistance ( value: number ): LaneDistance {
	return value as LaneDistance;
}
