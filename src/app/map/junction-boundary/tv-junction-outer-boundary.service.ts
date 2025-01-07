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


/**
 * @deprecated
 */
@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionOuterBoundaryService {

	constructor (
		private junctionCornerRoadService: TvJunctionCornerRoadService,
		private debugService: DebugDrawService,
	) {
	}

	update ( junction: TvJunction, boundary: TvJunctionBoundary ): void {

		const links = junction.getRoadLinks();

		const sorted = GeometryUtils.sortCoordsByAngle( links.map( link => link.toRoadCoord() ) );

		sorted.forEach( coord => {

			// NOTE: Sequence of the following code is important
			boundary.addSegment( this.createJointSegment( coord ) );

			this.findAndAddCornerRoad( junction, coord, boundary );

		} );

	}

	findAndAddCornerRoad ( junction: TvJunction, coord: TvRoadCoord, boundary: TvJunctionBoundary ): void {

		const connection = this.junctionCornerRoadService.getCornerConnectionForRoad( junction, coord.road );

		if ( !connection ) {
			Log.warn( 'No corner road found for junction connection' );
			return;
		}

		// get the lane link which is connected to the lowest lane
		const link = connection.getOuterLaneLink();

		if ( !link ) {
			Log.warn( 'No lane link found for corner road' );
			return;
		}

		traverseLanes( connection.connectingRoad, link.to, ( lane: TvLane ) => {

			boundary.addSegment( this.createLaneSegment( connection.connectingRoad, lane ) );

		} );

	}

	private createJointSegment ( roadCoord: TvRoadCoord ): TvJointBoundary {

		let startLane: TvLane;
		let endLane: TvLane;

		if ( roadCoord.contact == TvContactPoint.END ) {

			startLane = roadCoord.laneSection.getLeftMostLane();
			endLane = roadCoord.laneSection.getRightMostLane();

		} else {

			startLane = roadCoord.laneSection.getRightMostLane();
			endLane = roadCoord.laneSection.getLeftMostLane();

		}

		return new TvJointBoundary( roadCoord.road, roadCoord.contact, startLane, endLane );

	}

	private createLaneSegment ( connectingRoad: TvRoad, connectionLane: TvLane ): TvLaneBoundary {

		const boundary = new TvLaneBoundary();

		boundary.road = connectingRoad;

		boundary.boundaryLane = connectionLane;

		boundary.sStart = connectionLane.getLaneSection().s;

		boundary.sEnd = connectionLane.getLaneSection().endS;

		return boundary;

	}

}
