/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Log } from "app/core/utils/log";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { RoadWidthService } from "app/services/road/road-width.service";
import { Maths } from "app/utils/maths";
import { Vector3 } from "three";
import { TvContactPoint, TvLaneSide } from "../models/tv-common";
import { TvRoad } from "../models/tv-road.model";
import { TvJointBoundary, TvJunctionBoundary, TvJunctionSegmentBoundary, TvLaneBoundary } from "./tv-junction-boundary";
import { TvPosTheta } from "../models/tv-pos-theta";
import { LanePositionService } from "app/services/lane/lane-position.service";

@Injectable( {
	providedIn: 'root'
} )
export class BoundaryPositionService {

	constructor (
		private roadPositionService: RoadGeometryService,
		private roadWidthService: RoadWidthService,
		private lanePositionService: LanePositionService,
	) { }

	getBoundaryPositions ( boundary: TvJunctionBoundary ): Vector3[] {

		return boundary.segments.flatMap( segment => this.getSegmentPositions( segment ) );

	}

	getSegmentPositions ( segment: TvJunctionSegmentBoundary ): Vector3[] {

		if ( segment instanceof TvLaneBoundary ) {

			return this.getLaneBoundaryPositions( segment );

		} else if ( segment instanceof TvJointBoundary ) {

			return this.getJointBoundaryPositions( segment );

		}

		throw new Error( 'Invalid segment type' );
	}

	// eslint-disable-next-line max-lines-per-function
	private getJointBoundaryPositions ( joint: TvJointBoundary ): Vector3[] {

		if ( joint.road.geometries.length == 0 ) {
			Log.warn( 'Road has no geometries', joint.road.toString() );
			return [];
		}

		if ( joint.road.length == 0 ) {
			Log.warn( 'Road has no length', joint.road.toString() );
			return [];
		}

		const posTheta = this.roadPositionService.findContactPosition( joint.road, joint.contactPoint );

		const roadWidth = this.roadWidthService.findRoadWidthAt( joint.road, posTheta.s );

		const t = roadWidth.leftSideWidth - roadWidth.rightSideWidth;

		// return only 2 points for joint boundary

		let start: Vector3;

		if ( joint.contactPoint == TvContactPoint.START ) {

			start = joint.jointLaneStart.side == TvLaneSide.RIGHT ?
				joint.road.getLaneEndPosition( joint.jointLaneStart, posTheta.s ).toVector3() :
				joint.road.getLaneStartPosition( joint.jointLaneStart, posTheta.s ).toVector3();

		} else if ( joint.contactPoint == TvContactPoint.END ) {

			start = joint.jointLaneStart.side == TvLaneSide.RIGHT ?
				joint.road.getLaneStartPosition( joint.jointLaneStart, posTheta.s ).toVector3() :
				joint.road.getLaneEndPosition( joint.jointLaneStart, posTheta.s ).toVector3();

		}

		const mid = joint.road.getPosThetaAt( posTheta.s, t * 0.5 ).toVector3();

		let end: Vector3;

		if ( joint.contactPoint == TvContactPoint.START ) {

			end = joint.jointLaneEnd.side == TvLaneSide.RIGHT ?
				joint.road.getLaneStartPosition( joint.jointLaneEnd, posTheta.s ).toVector3() :
				joint.road.getLaneEndPosition( joint.jointLaneEnd, posTheta.s ).toVector3();

		} else if ( joint.contactPoint == TvContactPoint.END ) {

			end = joint.jointLaneEnd.side == TvLaneSide.RIGHT ?
				joint.road.getLaneEndPosition( joint.jointLaneEnd, posTheta.s ).toVector3() :
				joint.road.getLaneStartPosition( joint.jointLaneEnd, posTheta.s ).toVector3();

		}

		return [ start, mid, end ];
	}

	private getLaneBoundaryPositions ( boundary: TvLaneBoundary ): Vector3[] {

		if ( boundary.road.geometries.length == 0 ) {
			Log.warn( 'Road has no geometries', boundary.road.toString() );
			return [];
		}

		if ( boundary.road.length == 0 ) {
			Log.warn( 'Road has no length', boundary.road.toString() );
			return [];
		}

		return this.getLaneEndPositions( boundary );
	}

	private getLaneEndPositions ( boundary: TvLaneBoundary ): Vector3[] {

		const positions: Vector3[] = [];

		const start = this.getRoadPosition( boundary.getRoad(), boundary.sStart );

		const end = this.getRoadPosition( boundary.getRoad(), boundary.sEnd );

		const laneSection = boundary.getLane().getLaneSection();

		// push first point
		positions.push( this.lanePositionService.getLaneEndPoint( boundary.getRoad(), laneSection, boundary.getLane(), start.s + Maths.Epsilon ).toVector3() );

		for ( let s = start.s; s <= end.s; s += 1 ) {

			const posTheta = this.getRoadPosition( boundary.getRoad(), s );

			const position = this.lanePositionService.getLaneEndPoint( boundary.getRoad(), laneSection, boundary.getLane(), posTheta.s ).toVector3();

			positions.push( position );

		}

		// push last point
		positions.push( this.lanePositionService.getLaneEndPoint( boundary.getRoad(), laneSection, boundary.getLane(), end.s - Maths.Epsilon ).toVector3() );

		return positions;

	}

	private getRoadPosition ( road: TvRoad, value: number | TvContactPoint ): TvPosTheta {

		if ( typeof value == 'number' ) {

			return this.roadPositionService.findRoadPosition( road, value );

		} else if ( value == TvContactPoint.START ) {

			return this.roadPositionService.findRoadPosition( road, 0 );

		} else if ( value == TvContactPoint.END ) {

			return this.roadPositionService.findRoadPosition( road, road.length );

		}

	}

}
