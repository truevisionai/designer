import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvBoundarySegmentType, TvJointBoundary, TvJunctionBoundary, TvLaneBoundary } from "./tv-junction-boundary";
import { GeometryUtils } from "../../services/surface/geometry-utils";
import { LaneUtils } from "../../utils/lane.utils";
import { TvRoadCoord } from "../models/TvRoadCoord";
import { TvRoad } from "../models/tv-road.model";
import { TvLane } from "../models/tv-lane";
import { TvContactPoint } from "../models/tv-common";
import { JunctionUtils } from "app/utils/junction.utils";
import { Log } from "app/core/utils/log";
import { Vector3 } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryFactory {

	static createInnerBoundary ( junction: TvJunction ): TvJunctionBoundary {

		const boundary = new TvJunctionBoundary();

		const coords = GeometryUtils.sortCoordsByAngle( junction.getRoadCoords() );

		coords.forEach( coord => {

			// NOTE: Sequence of the following code is important

			const lowestLane = LaneUtils.findLowestCarriageWayLane( coord.laneSection );

			junction.getConnections().filter( c => c.incomingRoadId == coord.roadId ).forEach( connection => {

				const link = connection.laneLink.find( link => link.incomingLane == lowestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.segments.push( segment );

				}

			} );

			const segment = this.createInnerJointSegment( coord );

			boundary.segments.push( segment );

			const highestLane = LaneUtils.findHighestCarriageWayLane( coord.laneSection );

			junction.getConnections().filter( c => c.incomingRoadId == coord.roadId ).forEach( connection => {

				const link = connection.laneLink.find( link => link.incomingLane == highestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.segments.push( segment );
				}

			} );

		} );

		this.sortBoundarySegments( boundary );

		return boundary;

	}

	static createOuterBoundary ( junction: TvJunction ): TvJunctionBoundary {

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

			const segment = this.createOuterJointSegment( coord );

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

		this.sortBoundarySegments( boundary );

		return boundary;
	}

	private static createOuterJointSegment ( roadCoord: TvRoadCoord ) {

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

	private static createInnerJointSegment ( roadCoord: TvRoadCoord ) {

		const boundary = new TvJointBoundary();

		boundary.road = roadCoord.road;

		boundary.contactPoint = roadCoord.contact;

		if ( roadCoord.contact == TvContactPoint.END ) {

			boundary.jointLaneStart = LaneUtils.findHighestCarriageWayLane( roadCoord.laneSection );
			boundary.jointLaneEnd = LaneUtils.findLowestCarriageWayLane( roadCoord.laneSection );

		} else {

			boundary.jointLaneStart = LaneUtils.findLowestCarriageWayLane( roadCoord.laneSection );
			boundary.jointLaneEnd = LaneUtils.findHighestCarriageWayLane( roadCoord.laneSection );

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

	static sortBoundarySegments ( boundary: TvJunctionBoundary ) {

		if ( boundary.segments.length == 0 ) {
			Log.error( 'No segments found in boundary' );
			return
		}

		const segments = boundary.segments;

		const points = segments.map( segment => {

			const positions = JunctionUtils.convetToPositions( segment );

			if ( positions.length == 0 ) {
				Log.error( 'No positions found in segment' );
				return { position: new Vector3(), segment };
			}

			return { position: positions[ 0 ], segment };

		} );

		const centroid = GeometryUtils.getCentroid( points.map( p => p.position ) );

		points.sort( ( a, b ) => {

			const angleA = GeometryUtils.getAngle( centroid, a.position );
			const angleB = GeometryUtils.getAngle( centroid, b.position );

			return angleA - angleB;

		} );


		boundary.segments = [];
		boundary.segments = points.map( p => p.segment );

	}

}
