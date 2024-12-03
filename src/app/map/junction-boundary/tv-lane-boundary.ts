import { TvRoad } from "../models/tv-road.model";
import { TvLane } from "../models/tv-lane";
import { TvContactPoint } from "../models/tv-common";
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
export class TvLaneBoundary implements TvJunctionSegmentBoundary {

	type: TvBoundarySegmentType = TvBoundarySegmentType.LANE;
	road: TvRoad;
	boundaryLane: TvLane;
	sStart: number | TvContactPoint;
	sEnd: number | TvContactPoint;

	constructor ( road?: TvRoad, boundaryLane?: TvLane, sStart?: number | TvContactPoint, sEnd?: number | TvContactPoint ) {
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

	getPoints ( stepSize = 1 ): TvPosTheta[] {

		if ( this.road.geometries.length == 0 ) {
			Log.warn( 'Road has no geometries', this.road.toString() );
			return [];
		}

		if ( this.road.length == 0 ) {
			Log.warn( 'Road has no length', this.road.toString() );
			return [];
		}

		return this.convertBoundaryToPositions( stepSize );

	}

	private convertBoundaryToPositions ( stepSize ): TvPosTheta[] {

		const positions: TvPosTheta[] = [];

		const start = this.road.getPosThetaAt( createRoadDistance( this.road, this.sStart ) );
		const end = this.road.getPosThetaAt( createRoadDistance( this.road, this.sEnd ) );

		positions.push( this.road.getLaneEndPosition( this.boundaryLane, start.s + Maths.Epsilon as RoadDistance ) );

		for ( let s = start.s; s <= end.s; s += stepSize ) {

			const posTheta = this.road.getPosThetaAt( s );
			const position = this.road.getLaneEndPosition( this.boundaryLane, posTheta.s as RoadDistance );

			positions.push( position );

		}

		positions.push( this.road.getLaneEndPosition( this.boundaryLane, end.s - Maths.Epsilon as RoadDistance ) );

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
