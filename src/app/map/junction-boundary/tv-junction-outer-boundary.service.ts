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
import { traverseLanes } from "app/utils/road.utils";
import { TvLaneBoundary } from "./tv-lane-boundary";
import { TvJointBoundary } from "./tv-joint-boundary";

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

		if ( !connection ) return;

		// get the lane link which is connected to the lowest lane
		const link = connection.getLowestLaneLink();

		traverseLanes( connection.connectingRoad, link.to, ( lane: TvLane ) => {

			boundary.addSegment( this.createLaneSegment( connection.connectingRoad, lane ) );

		} );

	}

	private createJointSegment ( roadCoord: TvRoadCoord ): TvJointBoundary {

		const boundary = new TvJointBoundary();

		boundary.road = roadCoord.road;

		boundary.contactPoint = roadCoord.contact;

		if ( roadCoord.contact == TvContactPoint.END ) {

			boundary.jointLaneStart = roadCoord.laneSection.getLeftMostLane();
			boundary.jointLaneEnd = roadCoord.laneSection.getRightMostLane();

		} else {

			boundary.jointLaneStart = roadCoord.laneSection.getRightMostLane();
			boundary.jointLaneEnd = roadCoord.laneSection.getLeftMostLane();

		}

		return boundary;

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
