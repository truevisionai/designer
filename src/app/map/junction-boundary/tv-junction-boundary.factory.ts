/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvJunctionBoundary, TvJunctionSegmentBoundary } from "./tv-junction-boundary";
import { GeometryUtils } from "../../services/surface/geometry-utils";
import { LaneUtils } from "../../utils/lane.utils";
import { TvRoadCoord } from "../models/TvRoadCoord";
import { TvRoad } from "../models/tv-road.model";
import { TvLane } from "../models/tv-lane";
import { TvContactPoint } from "../models/tv-common";
import { Log } from "app/core/utils/log";
import { Vector3 } from "app/core/maths"
import { TvLaneBoundary } from "./tv-lane-boundary";
import { TvJointBoundary } from "./tv-joint-boundary";
import { RoadDistance } from "../road/road-distance";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryFactory {

	static createJointSegment ( junction: TvJunction, incoming: TvRoadCoord ): TvJunctionSegmentBoundary {

		// let startLane: TvLane;
		// let endLane: TvLane;

		// if ( incomingRoadCoord.contact == TvContactPoint.END ) {

		// 	startLane = incomingRoadCoord.laneSection.getLeftMostLane();
		// 	endLane = incomingRoadCoord.laneSection.getRightMostLane();

		// } else {

		// 	startLane = incomingRoadCoord.laneSection.getRightMostLane();
		// 	endLane = incomingRoadCoord.laneSection.getLeftMostLane();

		// }

		// return new TvJointBoundary( incomingRoadCoord.road, incomingRoadCoord.contact, startLane, endLane );

		let startLane: TvLane;
		let endLane: TvLane;

		if ( incoming.contact == TvContactPoint.END ) {

			startLane = this.getHighestLaneLink( junction, incoming );
			endLane = this.getLowestLaneLink( junction, incoming );

		} else {

			startLane = this.getLowestLaneLink( junction, incoming );
			endLane = this.getHighestLaneLink( junction, incoming );

		}

		return new TvJointBoundary( incoming.road, incoming.contact, startLane, endLane );

	}

	private static getHighestLaneLink ( junction: TvJunction, incoming: TvRoadCoord ): TvLane {

		const connections = junction.getConnectionsByRoad( incoming.road );

		let highestLane: TvLane | undefined;
		let highestLaneId: number = -Infinity;

		for ( const connection of connections ) {

			for ( const link of connection.getLaneLinks() ) {

				const nextLane = link.connectingLane.getSuccessorLane();
				const prevLane = link.connectingLane.getPredecessorLane();

				if ( nextLane?.laneSection.road.equals( incoming.road ) && nextLane.id > highestLaneId ) {

					highestLane = nextLane;
					highestLaneId = Math.max( highestLaneId, nextLane.id );

				} else if ( prevLane?.laneSection.road.equals( incoming.road ) && prevLane.id > highestLaneId ) {

					highestLane = prevLane;
					highestLaneId = Math.max( highestLaneId, prevLane.id );

				}
			}
		}

		if ( !highestLane ) {
			Log.debug( 'No highest lane found for junction connection' );
			return incoming.laneSection.getCenterLane();
		}

		return highestLane;

	}

	private static getLowestLaneLink ( junction: TvJunction, incoming: TvRoadCoord ): TvLane {

		const connections = junction.getConnectionsByRoad( incoming.road );

		let lowestLane: TvLane | undefined;
		let lowestLaneId: number = Infinity;

		for ( const connection of connections ) {

			for ( const link of connection.getLaneLinks() ) {

				const nextLane = link.connectingLane.getSuccessorLane();
				const prevLane = link.connectingLane.getPredecessorLane();

				if ( nextLane?.laneSection.road.equals( incoming.road ) && nextLane.id < lowestLaneId ) {

					lowestLane = nextLane;
					lowestLaneId = Math.min( lowestLaneId, nextLane.id );

				} else if ( prevLane?.laneSection.road.equals( incoming.road ) && prevLane.id < lowestLaneId ) {

					lowestLane = prevLane;
					lowestLaneId = Math.min( lowestLaneId, prevLane.id );

				}
			}
		}

		if ( !lowestLane ) {
			Log.debug( 'No lowest lane found for junction connection' );
			return incoming.laneSection.getCenterLane();
		}

		return lowestLane;
	}

	static createLaneBoundary ( road: TvRoad, lane: TvLane ): TvJunctionSegmentBoundary {

		const boundary = new TvLaneBoundary();

		boundary.road = road;

		boundary.boundaryLane = lane;

		boundary.sStart = lane.getLaneSection().s as RoadDistance;

		boundary.sEnd = lane.getLaneSection().endS as RoadDistance;

		return boundary;

	}

	static createInnerBoundary ( junction: TvJunction ): TvJunctionBoundary {

		const boundary = new TvJunctionBoundary();

		const coords = GeometryUtils.sortCoordsByAngle( junction.getRoadCoords() );

		coords.forEach( coord => {

			// NOTE: Sequence of the following code is important

			const lowestLane = LaneUtils.findLowestCarriageWayLane( coord.laneSection );

			junction.getConnectionsByRoad( coord.road ).forEach( connection => {

				const link = connection.getLinkForIncomingLane( lowestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.addSegment( segment );

				}

			} );

			const segment = this.createInnerJointSegment( coord );

			boundary.addSegment( segment );

			const highestLane = LaneUtils.findHighestCarriageWayLane( coord.laneSection );

			junction.getConnectionsByRoad( coord.road ).forEach( connection => {

				const link = connection.getLinkForIncomingLane( highestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.addSegment( segment );
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

			junction.getConnectionsByRoad( coord.road ).forEach( connection => {

				const link = connection.getLinkForIncomingLane( lowestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.addSegment( segment );

				}

			} );

			const segment = this.createOuterJointSegment( coord );

			boundary.addSegment( segment );

			const highestLane = LaneUtils.findHigestLane( coord.laneSection );

			junction.getConnectionsByRoad( coord.road ).forEach( connection => {

				const link = connection.getLinkForIncomingLane( highestLane );

				if ( link ) {

					const segment = this.createLaneSegment( connection.connectingRoad, link.connectingLane );

					boundary.addSegment( segment );
				}

			} );

		} );

		this.sortBoundarySegments( boundary );

		return boundary;
	}

	private static createOuterJointSegment ( roadCoord: TvRoadCoord ): TvJointBoundary {

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

	private static createInnerJointSegment ( roadCoord: TvRoadCoord ): TvJointBoundary {

		let startLane: TvLane;
		let endLane: TvLane;

		if ( roadCoord.contact == TvContactPoint.END ) {

			startLane = LaneUtils.findHighestCarriageWayLane( roadCoord.laneSection );
			endLane = LaneUtils.findLowestCarriageWayLane( roadCoord.laneSection );

		} else {

			startLane = LaneUtils.findLowestCarriageWayLane( roadCoord.laneSection );
			endLane = LaneUtils.findHighestCarriageWayLane( roadCoord.laneSection );

		}

		return new TvJointBoundary( roadCoord.road, roadCoord.contact, startLane, endLane );

	}

	private static createLaneSegment ( connectingRoad: TvRoad, connectionLane: TvLane ): TvLaneBoundary {

		const boundary = new TvLaneBoundary();

		boundary.road = connectingRoad;

		boundary.boundaryLane = connectionLane;

		boundary.sStart = 0 as RoadDistance

		boundary.sEnd = connectingRoad.length as RoadDistance;

		return boundary;

	}

	static sortBoundarySegments ( boundary: TvJunctionBoundary ): void {

		if ( boundary.getSegmentCount() == 0 ) {
			Log.error( 'No segments found in boundary' );
			return
		}

		const segments = boundary.getSegments();

		const points = segments.map( segment => {

			const positions = this.getSegmentPositions( segment );

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


		boundary.clearSegments();

		points.forEach( p => boundary.addSegment( p.segment ) );

	}

	private static getSegmentPositions ( segment: TvJunctionSegmentBoundary ): Vector3[] {

		if ( segment instanceof TvLaneBoundary ) {

			return this.getLanePositions( segment );

		} else if ( segment instanceof TvJointBoundary ) {

			return this.getJointPositions( segment );

		}

		throw new Error( 'Invalid segment type' );
	}

	private static getJointPositions ( joint: TvJointBoundary ): Vector3[] {

		if ( joint.road.geometries.length == 0 ) {
			Log.warn( 'Road has no geometries', joint.road.toString() );
			return [];
		}

		if ( joint.road.length == 0 ) {
			Log.warn( 'Road has no length', joint.road.toString() );
			return [];
		}

		return joint.getOuterPoints().map( point => point.toVector3() );
	}

	private static getLanePositions ( lane: TvLaneBoundary ): Vector3[] {

		return lane.getOuterPoints().map( point => point.toVector3() );

	}

}
