/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadCoord } from "../../models/TvRoadCoord";
import { TvContactPoint, TvLaneSide, TvLaneType } from "../../models/tv-common";
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { RoadService } from '../../../services/road/road.service';
import { TrafficRule } from 'app/map/models/traffic-rule';
import { MapService } from '../../../services/map/map.service';
import { LaneLinkService } from '../../../services/junction/lane-link.service';
import { TvUtils } from 'app/map/models/tv-utils';
import { Vector3 } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class ConnectionService {

	constructor (
		private roadService: RoadService,
		private mapService: MapService,
		private linkService: LaneLinkService
	) {
	}

	get connections () {

		return this.mapService.map.getJunctions().flatMap( junction => junction.getConnections() );

	}

	createConnectionV2 ( junction: TvJunction, incomingRoad: TvRoad, connectingRoad: TvRoad, contact: TvContactPoint, outgoingRoad?: TvRoad ) {

		const id = junction.connections.size + 1;

		const connection = new TvJunctionConnection( id, incomingRoad, connectingRoad, contact, outgoingRoad );

		connection.junction = junction;

		return connection
	}

	createConnections ( junction: TvJunction, coords: TvRoadCoord[] ): TvJunctionConnection[] {

		const connections = new Map<number, Set<number>>();
		const junctionConnections: TvJunctionConnection[] = [];

		for ( let i = 0; i < coords.length; i++ ) {

			const coordA = coords[ i ];

			for ( let j = i + 1; j < coords.length; j++ ) { // Start from i + 1 to avoid duplicates

				const coordB = coords[ j ];

				// Skip if same road
				if ( coordA.roadId === coordB.roadId ) continue;

				// Ensure the smaller ID is always first to avoid duplicates
				let smaller = Math.min( coordA.roadId, coordB.roadId );
				let larger = Math.max( coordA.roadId, coordB.roadId );

				// Initialize the set if this is the first connection for this road
				if ( !connections.has( smaller ) ) {
					connections.set( smaller, new Set<number>() );
				}

				// Add the connection if it doesn't exist
				let existingConnections = connections.get( smaller );

				if ( existingConnections && !existingConnections.has( larger ) ) {

					existingConnections.add( larger );

					const connection = this.createConnection( junction, coordA, coordB );

					// Here you can do something with the unique connection, like creating an actual connection object
					junctionConnections.push( connection );

					junction.addConnection( connection )
				}
			}
		}

		// // If you need to return the connections from this function, you can convert the models to an array
		// // and models it to actual connection objects or whatever format you need
		// let result = [];

		// for ( let [ smaller, largerSet ] of connections.entries() ) {

		// 	for ( let larger of largerSet ) {

		// 		result.push( {
		// 			road1: smaller,
		// 			road2: larger
		// 		} );

		// 	}

		// }

		return junctionConnections;
	}

	createConnection ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, isCorner = false ): TvJunctionConnection {

		if ( incoming.road.trafficRule == TrafficRule.LHT ) {
			throw new Error( 'Traffic rule not implemented' );
		}

		const connectingRoad = this.roadService.createConnectionRoad( junction, incoming, outgoing );

		const laneSection = connectingRoad.addGetLaneSection( 0 );

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, true );

		const connection = new TvJunctionConnection(
			junction.connections.size,
			incoming.road,
			connectingRoad,
			TvContactPoint.START,
			outgoing.road
		);

		connection.junction = junction;

		this.roadService.add( connection.connectingRoad );

		this.linkService.createDrivingLinks( connection, incoming, outgoing );

		if ( isCorner ) {

			connection.markAsCornerConnection();

			connection.connectingRoad.markAsCornerRoad();

		}

		return connection;
	}

	postProcessJunction ( junction: TvJunction ) {

		const roads = junction.getRoads();

		const connections = junction.getConnections();

		function findClosedConnection ( road: TvRoad ) {

			const roadConnections = connections.filter( i => i.incomingRoadId == road.id );

			if ( roadConnections.length == 0 ) return;

			let minAngle = 2 * Math.PI; // Initialize with maximum possible angle (360 degrees)
			let minDistance = Infinity;
			let nearestConnection: TvJunctionConnection;

			for ( let i = 0; i < roadConnections.length; i++ ) {

				const connection = roadConnections[ i ];

				const connectingRoad = connection.connectingRoad;

				const p1 = connectingRoad.spline.getFirstPoint()
				const p1Direction = p1.getDirectionVector();

				const p2 = connectingRoad.spline.getLastPoint();
				const p2Direction = p2.getDirectionVector().negate();

				const distance = p1.position.distanceTo( p2.position );

				// find angle between road direction and connecting road direction
				let crossProduct = new Vector3().crossVectors( p1Direction, p2Direction );
				let angle = p1Direction.angleTo( p2Direction );

				// Determine if the angle is to the left or right
				if ( crossProduct.z < 0 ) {
					// Angle to the right
					angle = Math.PI * 2 - angle;
				}

				if ( angle < minAngle ) {

					minDistance = distance;
					minAngle = angle;
					nearestConnection = connection;

				}

			}

			return nearestConnection;

		}

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			const nearestConnection = findClosedConnection( road );

			if ( nearestConnection ) {

				nearestConnection.connectingRoad.markAsCornerRoad();

				nearestConnection.markAsCornerConnection();

			}

		}

		for ( let i = 0; i < connections.length; i++ ) {

			const connection = connections[ i ];

			this.postProcessConnection( junction, connection, connection.isCornerConnection );

		}

	}

	postProcessConnection ( junction: TvJunction, connection: TvJunctionConnection, isCorner: boolean = false ): TvJunctionConnection {

		const connectingRoad = connection.connectingRoad;
		// const incomingRoad = connection.incomingRoad;
		// const outgoingRoad = connection.outgoingRoad;

		if ( !isCorner ) return connection;

		this.linkService.createNonDrivingLinks( connection );

		this.linkService.addRoadMarks( connection );

		// add missing lanes if any
		if ( !connection.connectingLaneSection.areRightLanesInOrder() ) {

			const lanes = connection.connectingLaneSection.getLaneArray();

			for ( let i = 0; i < lanes.length; i++ ) {

				const lane = lanes[ i ];

				if ( lane.id != -i ) {

					const newLane = connection.connectingLaneSection.addLane( TvLaneSide.RIGHT, -i, TvLaneType.none, false, true );

					const incoming = connection.getIncomingPosition();
					const laneSection = connection.getIncomingLaneSection();
					const incomingLane = laneSection.getLaneById( -i );

					if ( !incomingLane ) {
						console.error( "incoming lane not found" );
						continue;
					}

					// NOTE: THIS CAN probably be added in road event listener also
					const widhtAtStart = incomingLane.getWidthValue( incoming.s );
					// const widthAtEnd = outgoing.lane.getWidthValue( outgoing.s );
					// connectionLane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );
					// connectionLane.addWidthRecord( roadLength, widthAtEnd, 0, 0, 0 );
					// TvUtils.computeCoefficients( connectionLane.width, roadLength );

					newLane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );
					newLane.addWidthRecord( connectingRoad.length, 0, 0, 0, 0 );

					TvUtils.computeCoefficients( newLane.width, connectingRoad.length );

				}

			}

		}

		if ( !connection.connectingLaneSection.areRightLanesInOrder() ) {
			console.error( "lanes are not orderd." + connection.connectingLaneSection.getLaneArray().map( i => i.id ) );
		}

		return connection;
	}

}
