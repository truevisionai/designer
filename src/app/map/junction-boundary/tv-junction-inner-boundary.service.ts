/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvContactPoint } from "../models/tv-common";
import { TvLane } from "../models/tv-lane";
import { TvRoad } from "../models/tv-road.model";
import { TvRoadCoord } from "../models/TvRoadCoord";
import { TvJunctionBoundary } from "./tv-junction-boundary";
import { TvJunctionCornerRoadService } from "./tv-junction-corner-road.service";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { GeometryUtils } from "app/services/surface/geometry-utils";
import { traverseLanes } from "app/utils/traverseLanes";
import { TvLaneBoundary } from "./tv-lane-boundary";
import { TvJointBoundary } from "./tv-joint-boundary";
import { Log } from "app/core/utils/log";
import { RoadDistance } from "../road/road-distance";

/**
 * @deprecated
 */
@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionInnerBoundaryService {

	constructor (
		private debugService: DebugDrawService,
		private junctionCornerRoadService: TvJunctionCornerRoadService
	) { }

	update ( junction: TvJunction, boundary: TvJunctionBoundary ): void {

		const links = junction.getRoadLinks();

		const sorted = GeometryUtils.sortCoordsByAngle( links.map( link => link.toRoadCoord() ) );

		sorted.forEach( coord => {

			// NOTE: Sequence of the following code is important
			boundary.addSegment( this.createJointSegment( junction, coord ) );

			this.findAndAddCornerRoad( junction, coord, boundary );

		} );

	}

	findAndAddCornerRoad ( junction: TvJunction, coord: TvRoadCoord, boundary: TvJunctionBoundary ): void {

		const connection = this.junctionCornerRoadService.getInnerConnectionForRoad( junction, coord.road );

		if ( !connection ) {
			Log.warn( 'No corner road found for junction connection' );
			return;
		}

		// get the lane link which is connected to the lowest lane
		// TODO: test this logic

		// OLD logic
		// const lanes = connection.getLaneLinks().map( link => link.getConnectingLane() );
		// const lastCarriagewayLane = this.getLastCarriagewayLane( lanes );

		// NEW logic
		const laneId = connection.getLaneSection().getRightCarriagewayBoundary();
		const lastCarriagewayLane = connection.getLaneSection().getLaneById( laneId );

		if ( !lastCarriagewayLane ) {
			Log.warn( 'No carriageway lane found for junction connection' );
			return;
		}

		traverseLanes( connection.connectingRoad, lastCarriagewayLane.id, ( lane: TvLane ) => {

			boundary.addSegment( this.createLaneSegment( connection.connectingRoad, lane ) );

		} );

	}

	private getLastCarriagewayLane ( lanes: TvLane[] ): TvLane {

		// sort lanes by id in ascending order
		const sortedLanes = lanes.sort( ( a, b ) => Math.abs( a.id ) - Math.abs( b.id ) );

		let prevLane: TvLane;

		for ( const lane of sortedLanes ) {

			if ( lane.id == 0 ) continue;

			if ( lane.isCarriageWay() ) {

				prevLane = lane;

			} else {

				return prevLane;

			}

		}

		return prevLane;

	}

	private createJointSegment ( junction: TvJunction, roadCoord: TvRoadCoord ): TvJointBoundary {

		let startLane: TvLane;
		let endLane: TvLane;

		if ( roadCoord.contact == TvContactPoint.END ) {

			startLane = roadCoord.laneSection.getHighestCarriageWayLane();
			endLane = roadCoord.laneSection.getLowestCarriageWayLane();

		} else {

			startLane = roadCoord.laneSection.getLowestCarriageWayLane();
			endLane = roadCoord.laneSection.getHighestCarriageWayLane();

		}

		return new TvJointBoundary( roadCoord.road, roadCoord.contact, startLane, endLane );

	}

	private createLaneSegment ( connectingRoad: TvRoad, connectionLane: TvLane ): TvLaneBoundary {

		const boundary = new TvLaneBoundary();

		boundary.road = connectingRoad;

		boundary.boundaryLane = connectionLane;

		boundary.sStart = connectionLane.getLaneSection().s as RoadDistance;

		boundary.sEnd = connectionLane.getLaneSection().endS as RoadDistance;

		return boundary;

	}

}
