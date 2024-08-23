import { Injectable } from '@angular/core';
import { TvLaneLocation } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadGeometryService } from '../road/road-geometry.service';
import { TvPosTheta } from 'app/map/models/tv-pos-theta';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class LanePositionService {

	private static _instance: LanePositionService;

	static get instance (): LanePositionService {
		if ( !LanePositionService._instance ) {
			LanePositionService._instance = new LanePositionService();
		}
		return LanePositionService._instance;
	}

	getCoordPoints ( coord: TvLaneCoord, location: TvLaneLocation ): TvPosTheta[] {
		return this.getPoints( coord.road, coord.laneSection, coord.lane, location );
	}

	getLaneStartPoints ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): TvPosTheta[] {
		return this.getLanePoints( road, laneSection, lane, TvLaneLocation.START );
	}

	getLaneStartPoint ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, s: number ): TvPosTheta {
		return this.findLanePosition( road, laneSection, lane, s, TvLaneLocation.START );
	}

	getLaneCenterPoints ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): TvPosTheta[] {
		return this.getLanePoints( road, laneSection, lane, TvLaneLocation.CENTER );
	}

	getLaneCenterPoint ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, s: number ): TvPosTheta {
		return this.findLanePosition( road, laneSection, lane, s, TvLaneLocation.CENTER );
	}

	getLaneEndPoints ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ): TvPosTheta[] {
		return this.getLanePoints( road, laneSection, lane, TvLaneLocation.END );
	}

	getLaneEndPoint ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, s: number ): TvPosTheta {
		return this.findLanePosition( road, laneSection, lane, s, TvLaneLocation.END );
	}

	getPoints ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, location: TvLaneLocation ): TvPosTheta[] {
		return this.getLanePoints( road, laneSection, lane, location );
	}

	getLanePointsById ( road: TvRoad, laneId: number, location: TvLaneLocation ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		road.getLaneProfile().getLaneSections().forEach( laneSection => {

			const lane = laneSection.getLaneById( laneId );

			if ( !lane ) {
				Log.warn( `Lane with id ${ laneId } not found in lane section ${ laneSection.id }` );
				return;
			}

			points.push( ...this.getPoints( road, laneSection, lane, location ) );

		} );

		return points;
	}

	findLaneStartPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ): TvPosTheta {
		return this.getLaneStartPoint( road, laneSection, lane, sOffset );
	}

	findLaneCenterPosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, sOffset: number ): TvPosTheta {
		return this.getLaneCenterPoint( road, laneSection, lane, sOffset );
	}

	/**
	 * Find the position of the lane at the given s and location
	 * @param road
	 * @param laneSection
	 * @param lane
	 * @param s
	 * @param location
	 */
	findLanePosition ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, s: number, location: TvLaneLocation ): TvPosTheta {

		const sign = lane.id > 0 ? 1 : -1;

		const offset = this.computeTOffset( laneSection, lane, s, location );

		const point = RoadGeometryService.instance.findRoadPosition( road, s, offset * sign );

		const laneHeight = lane.getHeightValue( s );

		point.z += laneHeight.getLinearValue( 1 );

		return point;
	}

	private getLanePoints ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane, location: TvLaneLocation ): TvPosTheta[] {

		const points: TvPosTheta[] = [];

		for ( let s = laneSection.s; s < laneSection.endS; s++ ) {

			points.push( this.findLanePosition( road, laneSection, lane, s, location ) );

		}

		// last point
		points.push( this.findLanePosition( road, laneSection, lane, laneSection.endS, location ) );

		return points;
	}

	private computeTOffset ( laneSection: TvLaneSection, lane: TvLane, s: number, location: TvLaneLocation ): number {

		if ( location === TvLaneLocation.CENTER ) {
			return laneSection.getWidthUptoCenter( lane, s - laneSection.s );
		}

		if ( location === TvLaneLocation.START ) {
			return laneSection.getWidthUptoStart( lane, s - laneSection.s );
		}

		if ( location === TvLaneLocation.END ) {
			return laneSection.getWidthUptoEnd( lane, s - laneSection.s );
		}

		throw new Error( 'Invalid location' );
	}
}
