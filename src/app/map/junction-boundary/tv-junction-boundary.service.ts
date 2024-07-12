/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from '../models/junctions/tv-junction';
import { TvRoadCoord } from '../models/TvRoadCoord';
import { TvBoundarySegmentType, TvJointBoundary, TvJunctionBoundary, TvJunctionSegmentBoundary, TvLaneBoundary } from './tv-junction-boundary';
import { TvRoad } from '../models/tv-road.model';
import { Vector3 } from 'three';
import { TvContactPoint } from '../models/tv-common';
import { TvJunctionConnection } from '../models/junctions/tv-junction-connection';
import { GeometryUtils } from 'app/services/surface/geometry-utils';

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryService {

	constructor () { }

	update ( junction: TvJunction ) {

		junction.boundary = this.createJunctionBoundary( junction );

	}

	getBoundaryPositions ( junction: TvJunction ): Vector3[] {

		const positions: Vector3[] = [];

		const coords = junction.getRoadCoords();

		for ( let i = 0; i < coords.length; i++ ) {

			const segment = this.createJointSegment( coords[ i ] );

			this.createBoundaryPositions( segment ).forEach( pos => positions.push( pos ) );

		}

		// TODO: add support for connections to make smoother boundary for junctions

		// const connections = this.getOutermostCornerConnections( junction );

		// for ( let i = 0; i < connections.length; i++ ) {

		// 	const connection = connections[ i ];

		// 	// if ( !connection.isCornerConnection ) continue;

		// 	const segment = this.createLaneSegment( connection.connectingRoad );

		// 	this.createBoundaryPositions( segment ).forEach( pos => positions.push( pos ) );

		// }

		const sortedPositions = GeometryUtils.sortByAngle( positions );

		return sortedPositions;
	}

	getOutermostCornerConnections ( junction: TvJunction ) {

		const items: TvJunctionConnection[] = [];

		const connections = junction.getConnections();

		// for each incoming road, find the outermost corner connection
		const pairs = new Map<TvRoad, TvJunctionConnection>();

		for ( let i = 0; i < connections.length; i++ ) {

			const connection = connections[ i ];

			if ( !connection.isCornerConnection ) continue;

			if ( !pairs.has( connection.incomingRoad ) ) {

				pairs.set( connection.incomingRoad, connection );

				continue;
			}

			const existing = pairs.get( connection.incomingRoad );

			if ( connection.laneLink.length == 0 || existing.laneLink.length == 0 ) continue;

			const existingLaneId = existing.laneLink[ 0 ].incomingLane.id;

			const connectionLaneId = connection.laneLink[ 0 ].incomingLane.id;

			if ( Math.abs( connectionLaneId ) > Math.abs( existingLaneId ) ) {

				pairs.set( connection.incomingRoad, connection );

			}

		}

		pairs.forEach( connection => items.push( connection ) );

		return items;
	}

	createJunctionBoundary ( junction: TvJunction ): TvJunctionBoundary {

		const boundary = new TvJunctionBoundary();

		junction.getRoadCoords().forEach( coord => {

			const segment = this.createJointSegment( coord );

			boundary.segments.push( segment );

		} );

		junction.getConnections().filter( c => c.isCornerConnection ).forEach( connection => {

			const segment = this.createLaneSegment( connection.connectingRoad );

			boundary.segments.push( segment );

		} );

		return boundary;
	}

	createJointSegment ( roadCoord: TvRoadCoord ) {

		const boundary = new TvJointBoundary();

		boundary.road = roadCoord.road;

		boundary.contactPoint = roadCoord.contact;

		boundary.jointLaneStart = roadCoord.laneSection.getLeftMostLane();

		boundary.jointLaneEnd = roadCoord.laneSection.getRightMostLane();

		return boundary;

	}

	createLaneSegment ( road: TvRoad ) {

		const lane = road.getLastLaneSection().getRightMostLane();

		const boundary = new TvLaneBoundary();

		boundary.road = road;

		boundary.boundaryLane = lane;

		boundary.sStart = 0;

		boundary.sEnd = road.length;

		return boundary;

	}

	createBoundaryPositions ( boundary: TvJunctionSegmentBoundary ): Vector3[] {

		if ( boundary.type == TvBoundarySegmentType.JOINT ) {

			const joint = boundary as TvJointBoundary;

			const posTheta = joint.road.getPosThetaByContact( joint.contactPoint );

			const start = joint.road.getLaneEndPosition( joint.jointLaneStart, posTheta.s ).toVector3();

			const end = joint.road.getLaneEndPosition( joint.jointLaneEnd, posTheta.s ).toVector3();

			return [ start, end ];

		}

		if ( boundary.type == TvBoundarySegmentType.LANE ) {

			const laneBoundary = boundary as TvLaneBoundary;

			const positions: Vector3[] = [];

			const start = this.getPosTheta( laneBoundary.road, laneBoundary.sStart );

			const end = this.getPosTheta( laneBoundary.road, laneBoundary.sEnd );

			for ( let s = start.s; s < end.s; s++ ) {

				const posTheta = laneBoundary.road.getPosThetaAt( s );

				const position = laneBoundary.road.getLaneEndPosition( laneBoundary.boundaryLane, posTheta.s ).toVector3();

				positions.push( position );

			}

			return positions;
		}

	}

	getPosTheta ( road: TvRoad, input: number | TvContactPoint, ) {

		if ( typeof input == 'number' ) {

			return road.getPosThetaAt( input );

		} else if ( input == TvContactPoint.START ) {

			return road.getPosThetaAt( 0 );

		} else if ( input == TvContactPoint.END ) {

			return road.getPosThetaAt( road.length );

		}

	}
}
