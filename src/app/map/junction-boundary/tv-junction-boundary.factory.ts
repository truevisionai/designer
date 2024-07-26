import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvJointBoundary, TvJunctionBoundary, TvLaneBoundary } from "./tv-junction-boundary";
import { GeometryUtils } from "../../services/surface/geometry-utils";
import { LaneUtils } from "../../utils/lane.utils";
import { TvRoadCoord } from "../models/TvRoadCoord";
import { TvRoad } from "../models/tv-road.model";
import { TvLane } from "../models/tv-lane";
import { TvContactPoint } from "../models/tv-common";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryFactory {

	static createFromJunction ( junction: TvJunction ): TvJunctionBoundary {

		return this.createJunctionBoundary( junction );

	}

	private static createJunctionBoundary ( junction: TvJunction ): TvJunctionBoundary {

		const boundary = new TvJunctionBoundary();

		const coords = GeometryUtils.sortCoordsByAngle( junction.getRoadCoords() );

		coords.forEach( coord => {

			// NOTE: Sequence of the following code is important

			const lowestLane = LaneUtils.findLowestLane( coord.laneSection );

			junction.getConnections().filter( c => c.incomingRoadId == coord.roadId ).forEach( connection => {

				const link = connection.laneLink.find( link => link.incomingLane == lowestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.segments.push( segment );

				}

			} );

			const segment = this.createJointSegment( coord );

			boundary.segments.push( segment );

			const highestLane = LaneUtils.findHigestLane( coord.laneSection );

			junction.getConnections().filter( c => c.incomingRoadId == coord.roadId ).forEach( connection => {

				const link = connection.laneLink.find( link => link.incomingLane == highestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.segments.push( segment );
				}

			} );

		} );

		return boundary;
	}

	private static createJointSegment ( roadCoord: TvRoadCoord ) {

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

	private static createLaneSegment ( connectingRoad: TvRoad, connectionLane: TvLane ) {

		const boundary = new TvLaneBoundary();

		boundary.road = connectingRoad;

		boundary.boundaryLane = connectionLane;

		boundary.sStart = 0;

		boundary.sEnd = connectingRoad.length;

		return boundary;

	}

}
