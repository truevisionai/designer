import { TvRoad } from "../models/tv-road.model";
import { TvLane } from "../models/tv-lane";
import { TvContactPoint, TvLaneLocation, TvLaneSide } from "../models/tv-common";
import { TvPosTheta } from "../models/tv-pos-theta";
import { Maths } from "../../utils/maths";
import { TvBoundarySegmentType, TvJunctionSegmentBoundary } from "./tv-junction-boundary";
import { createRoadDistance, RoadDistance } from "../road/road-distance";
import { Log } from "app/core/utils/log";

/**
 * // roadId="8" boundaryLane="-2" sStart="begin" sEnd="end"
 * // ususally for connecting roads
 * // goes along the last/boundary lane of the connecting road
 */
export class TvLaneBoundary extends TvJunctionSegmentBoundary {

	type: TvBoundarySegmentType = TvBoundarySegmentType.LANE;
	road: TvRoad;
	boundaryLane: TvLane;
	sStart: RoadDistance | TvContactPoint;
	sEnd: RoadDistance | TvContactPoint;

	constructor ( road?: TvRoad, boundaryLane?: TvLane, sStart?: RoadDistance | TvContactPoint, sEnd?: RoadDistance | TvContactPoint ) {
		super();
		this.road = road;
		this.boundaryLane = boundaryLane;
		this.sStart = sStart;
		this.sEnd = sEnd;
	}

	getRoad (): TvRoad {
		return this.road;
	}

	getLane (): TvLane {
		return this.boundaryLane;
	}

	toString (): string {
		return `LaneBoundary: roadId=${ this.road.id } boundaryLane=${ this.boundaryLane.id } sStart=${ this.sStart } sEnd=${ this.sEnd }`;
	}

	getPoints (): TvPosTheta[] {

		if ( this.boundaryLane.isCarriageWay() ) {
			return this.getOuterPoints();
		}

		return this.getInnerPoints();

	}

	getOuterPoints ( stepSize: number = 1 ): TvPosTheta[] {

		if ( this.road.geometries.length == 0 ) {
			Log.warn( 'Road has no geometries', this.road.toString() );
			return [];
		}

		if ( this.road.length == 0 ) {
			Log.warn( 'Road has no length', this.road.toString() );
			return [];
		}

		return this.getBoundaryPositions( stepSize, TvLaneLocation.END );

	}

	getInnerPoints ( stepSize: number = 1 ): TvPosTheta[] {

		if ( this.road.geometries.length == 0 ) {
			Log.warn( 'Road has no geometries', this.road.toString() );
			return [];
		}

		if ( this.road.length == 0 ) {
			Log.warn( 'Road has no length', this.road.toString() );
			return [];
		}

		return this.getBoundaryPositions( stepSize, TvLaneLocation.START );

	}

	private getBoundaryPositions ( stepSize: number, location: TvLaneLocation ): TvPosTheta[] {

		// TODO: remove this
		// this is a temporary bug fix for the height of the lane boundary
		// it should be removed when the height is fixed in the road
		const TEMP_BUG_FIX_HEIGHT = false;

		const positions: TvPosTheta[] = [];

		const start = this.road.getPosThetaAt( createRoadDistance( this.road, this.sStart ) );
		const end = this.road.getPosThetaAt( createRoadDistance( this.road, this.sEnd ) );

		positions.push( this.road.getLanePosition( this.boundaryLane, start.s + Maths.Epsilon as RoadDistance, location, 0, TEMP_BUG_FIX_HEIGHT ) );

		for ( let s = start.s; s <= end.s; s += stepSize ) {

			const posTheta = this.road.getPosThetaAt( s );
			const position = this.road.getLanePosition( this.boundaryLane, posTheta.s as RoadDistance, location, 0, TEMP_BUG_FIX_HEIGHT );

			positions.push( position );

		}

		positions.push( this.road.getLanePosition( this.boundaryLane, end.s - Maths.Epsilon as RoadDistance, location, 0, TEMP_BUG_FIX_HEIGHT ) );

		return positions;

	}

	clone (): TvLaneBoundary {
		const lane = new TvLaneBoundary();
		lane.road = this.road;
		lane.boundaryLane = this.boundaryLane;
		lane.sStart = this.sStart;
		lane.sEnd = this.sEnd;
		return lane;
	}
}
