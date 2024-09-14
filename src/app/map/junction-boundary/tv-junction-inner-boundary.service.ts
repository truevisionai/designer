/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { JunctionRoadService } from "app/services/junction/junction-road.service";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvContactPoint } from "../models/tv-common";
import { TvLane } from "../models/tv-lane";
import { TvRoad } from "../models/tv-road.model";
import { TvRoadCoord } from "../models/TvRoadCoord";
import { TvJunctionBoundary, TvLaneBoundary, TvJointBoundary } from "./tv-junction-boundary";
import { BoundaryPositionService } from "./boundary-position.service";
import { TvJunctionCornerRoadService } from "./tv-junction-corner-road.service";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { GeometryUtils } from "app/services/surface/geometry-utils";
import { traverseLanes } from "app/utils/road.utils";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionInnerBoundaryService {

	constructor (
		private junctionRoadService: JunctionRoadService,
		private boundaryPositionService: BoundaryPositionService,
		private debugService: DebugDrawService,
		private junctionCornerRoadService: TvJunctionCornerRoadService
	) { }

	// eslint-disable-next-line max-lines-per-function
	update ( junction: TvJunction, boundary: TvJunctionBoundary ): void {

		const links = this.junctionRoadService.getRoadLinks( junction );

		const sorted = GeometryUtils.sortCoordsByAngle( links.map( link => link.toRoadCoord() ) );

		sorted.forEach( coord => {

			// NOTE: Sequence of the following code is important
			boundary.addSegment( this.createJointSegment( junction, coord ) );

			this.findAndAddCornerRoad( junction, coord, boundary );

		} );

	}

	findAndAddCornerRoad ( junction: TvJunction, coord: TvRoadCoord, boundary: TvJunctionBoundary ): void {

		const connection = this.junctionCornerRoadService.getInnerConnectionForRoad( junction, coord.road );

		if ( !connection ) return;

		// get the lane link which is connected to the lowest lane
		const link = connection.getLowestLaneLink();

		traverseLanes( connection.connectingRoad, link.to, ( lane: TvLane ) => {

			boundary.addSegment( this.createLaneSegment( connection.connectingRoad, lane ) );

		} );

	}

	private createJointSegment ( junction: TvJunction, roadCoord: TvRoadCoord ): TvJointBoundary {

		const boundary = new TvJointBoundary();

		boundary.road = roadCoord.road;

		boundary.contactPoint = roadCoord.contact;

		if ( roadCoord.contact == TvContactPoint.END ) {

			boundary.jointLaneStart = roadCoord.laneSection.getHighestCarriageWayLane();
			boundary.jointLaneEnd = roadCoord.laneSection.getLowestCarriageWayLane();

		} else {

			boundary.jointLaneStart = roadCoord.laneSection.getLowestCarriageWayLane();
			boundary.jointLaneEnd = roadCoord.laneSection.getHighestCarriageWayLane();

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

// @Injectable( {
// 	providedIn: 'root'
// } )
// export class TvJunctionInnerBoundaryService {

// 	constructor (
// 		private junctionRoadService: JunctionRoadService,
// 		private boundaryPositionService: BoundaryPositionService
// 	) { }

// 	update ( junction: TvJunction, boundary: TvJunctionBoundary ): void {

// 		const links = this.junctionRoadService.getRoadLinks( junction );

// 		const sortedCoords = GeometryUtils.sortCoordsByAngle( links.map( link => link.toRoadCoord() ) );

// 		sortedCoords.forEach( coord => {

// 			// NOTE: Sequence of the following code is important

// 			const lowestLaneSegment = this.createLowestLaneSegment( junction, coord );
// 			if ( lowestLaneSegment ) boundary.addSegment( lowestLaneSegment );

// 			const jointSegment = this.createInnerJointSegment( coord.road, coord.contact );
// 			if ( jointSegment ) boundary.addSegment( jointSegment );

// 			const highestLaneSegment = this.createHighestLaneSegment( junction, coord );
// 			if ( highestLaneSegment ) boundary.addSegment( highestLaneSegment );

// 		} );

// 		this.sortBoundarySegments( boundary );

// 	}

// 	createLowestLaneSegment ( junction: TvJunction, coord: TvRoadCoord ) {

// 		const lowestLane = coord.laneSection.getLowestCarriageWayLane();

// 		const connection = junction.getConnections().filter( c => c.incomingRoadId == coord.roadId ).find( connection => {

// 			return connection.laneLink.find( link => link.incomingLane == lowestLane );

// 		} );

// 		if ( !connection ) {
// 			console.error( 'No connection found for road', coord.roadId );
// 			return;
// 		}

// 		const link = connection.laneLink.find( link => link.incomingLane == lowestLane );

// 		if ( !link ) {
// 			console.error( 'No link found for lane', lowestLane.id );
// 			return;
// 		}

// 		return this.createLaneSegment( connection.connectingRoad, link.connectingLane );

// 	}

// 	createHighestLaneSegment ( junction: TvJunction, coord: TvRoadCoord ) {

// 		const highestLane = coord.laneSection.getHighestCarriageWayLane();

// 		const connection = junction.getConnections().filter( c => c.incomingRoadId == coord.roadId ).find( connection => {

// 			return connection.laneLink.find( link => link.incomingLane == highestLane );

// 		} );

// 		if ( !connection ) {
// 			console.error( 'No connection found for road', coord.roadId );
// 			return;
// 		}

// 		const link = connection.laneLink.find( link => link.incomingLane == highestLane );

// 		if ( !link ) {
// 			console.error( 'No link found for lane', highestLane.id );
// 			return;
// 		}

// 		return this.createLaneSegment( connection.connectingRoad, link.connectingLane );

// 	}

// 	private createLaneSegment ( road: TvRoad, boundaryLane: TvLane ) {

// 		return new TvLaneBoundary( road, boundaryLane, 0, road.length );

// 	}

// 	private createOuterJointSegment ( road: TvRoad, contactPoint: TvContactPoint ) {

// 		const laneSection = road.getLaneProfile().getLaneSectionAtContact( contactPoint );

// 		if ( contactPoint == TvContactPoint.END ) {

// 			const jointLaneStart = laneSection.getLeftMostLane();
// 			const jointLaneEnd = laneSection.getRightMostLane();

// 			return new TvJointBoundary( road, contactPoint, jointLaneStart, jointLaneEnd );

// 		} else {

// 			const jointLaneStart = laneSection.getRightMostLane();
// 			const jointLaneEnd = laneSection.getLeftMostLane();

// 			return new TvJointBoundary( road, contactPoint, jointLaneStart, jointLaneEnd );

// 		}

// 	}

// 	private createInnerJointSegment ( road: TvRoad, contactPoint: TvContactPoint ) {

// 		const laneSection = road.getLaneProfile().getLaneSectionAtContact( contactPoint );

// 		if ( contactPoint == TvContactPoint.END ) {

// 			const jointLaneStart = laneSection.getHighestCarriageWayLane();
// 			const jointLaneEnd = laneSection.getLowestCarriageWayLane();

// 			return new TvJointBoundary( road, contactPoint, jointLaneStart, jointLaneEnd );

// 		} else {

// 			const jointLaneStart = laneSection.getLowestCarriageWayLane();
// 			const jointLaneEnd = laneSection.getHighestCarriageWayLane();

// 			return new TvJointBoundary( road, contactPoint, jointLaneStart, jointLaneEnd );

// 		}

// 	}

// 	// eslint-disable-next-line max-lines-per-function
// 	private sortBoundarySegments ( boundary: TvJunctionBoundary ): void {

// 		if ( boundary.segments.length == 0 ) {
// 			Log.error( 'No segments found in boundary' );
// 			return;
// 		}

// 		const tempPoints = boundary.getSegments().map( segment => {

// 			const positions = this.boundaryPositionService.getSegmentPositions( segment );

// 			if ( positions.length == 0 ) {
// 				Log.error( 'No positions found in segment' );
// 				return { position: new Vector3(), segment };
// 			}

// 			return { position: positions[ 0 ], segment };

// 		} );

// 		const centroid = GeometryUtils.getCentroid( tempPoints.map( p => p.position ) );

// 		tempPoints.sort( ( a, b ) => {

// 			const angleA = GeometryUtils.getAngle( centroid, a.position );
// 			const angleB = GeometryUtils.getAngle( centroid, b.position );

// 			return angleA - angleB;

// 		} );

// 		boundary.clearSegments();

// 		boundary.addSegments( tempPoints.map( p => p.segment ) );

// 	}


// }
