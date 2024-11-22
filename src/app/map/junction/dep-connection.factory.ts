/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadCoord } from "../models/TvRoadCoord";
import { TvContactPoint, TvLaneSide, TvLaneType } from "../models/tv-common";
import { TvJunctionConnection } from 'app/map/models/connections/tv-junction-connection';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { RoadService } from '../../services/road/road.service';
import { TrafficRule } from 'app/map/models/traffic-rule';
import { MapService } from '../../services/map/map.service';
import { TvUtils } from 'app/map/models/tv-utils';
import { Vector3 } from 'three';
import { SplineGeometryGenerator } from "../../services/spline/spline-geometry-generator";
import { TvJunctionLaneLink } from 'app/map/models/junctions/tv-junction-lane-link';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvLaneSection } from 'app/map/models/tv-lane-section';
import { LaneUtils } from 'app/utils/lane.utils';
import { ConnectionFactory } from "../../factories/connection.factory";

@Injectable( {
	providedIn: 'root'
} )
export class DepConnectionFactory {

	constructor (
		private splineBuilder: SplineGeometryGenerator,
		private roadService: RoadService,
		private mapService: MapService,
		private factory: ConnectionFactory
	) {
	}

	get connections () {

		return this.mapService.map.getJunctions().flatMap( junction => junction.getConnections() );

	}

	createConnection ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord, isCorner = false ): TvJunctionConnection {

		if ( incoming.road.trafficRule == TrafficRule.LHT ) {
			// TODO: Implement this
			console.error( 'Traffic rule not implemented' );
		}

		const connectingRoad = this.roadService.createConnectionRoad( junction, incoming, outgoing );

		const laneSection = connectingRoad.getLaneProfile().addGetLaneSection( 0 );

		laneSection.createLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, true );

		const connection = new TvJunctionConnection(
			junction.getConnectionCount(),
			incoming.road,
			connectingRoad,
			TvContactPoint.START,
		);

		this.splineBuilder.buildSpline( connection.connectingRoad.spline );

		this.splineBuilder.buildSegments( connection.connectingRoad.spline );

		// NOTE: bounding box will not be built for if road has not lanes
		// this.splineBuilder.buildBoundingBox( connection.connectingRoad.spline );

		this.createDrivingLinks( connection, incoming, outgoing );

		if ( isCorner ) {

			connection.markAsCornerConnection();

			connection.connectingRoad.markAsCornerRoad();

		}

		return connection;
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

	postProcessJunction ( junction: TvJunction ) {

		const roads = junction.getIncomingRoads();

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

		if ( !isCorner ) return connection;

		this.addRoadMarks( connection );

		// add missing lanes if any
		if ( !connection.connectingLaneSection.areRightLanesInOrder() ) {

			const lanes = connection.connectingLaneSection.getLanes();

			for ( let i = 0; i < lanes.length; i++ ) {

				const lane = lanes[ i ];

				if ( lane.id != -i ) {

					const newLane = connection.connectingLaneSection.createLane( TvLaneSide.RIGHT, -i, TvLaneType.none, false, true );

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

					newLane.updateWidthCoefficients();

				}

			}

		}

		if ( !connection.connectingLaneSection.areRightLanesInOrder() ) {
			console.error( "lanes are not orderd." + connection.connectingLaneSection.getLanes().map( i => i.id ) );
		}

		return connection;
	}

	private createDrivingLinks ( connection: TvJunctionConnection, incoming: TvRoadCoord, outgoing: TvRoadCoord ) {

		const incomingDirection = LaneUtils.determineDirection( incoming.contact );
		const outgoingDirection = LaneUtils.determineOutDirection( outgoing.contact );

		const incomingLaneCoords = incoming.laneSection.getLanes()
			.filter( lane => lane.type == TvLaneType.driving || lane.type == TvLaneType.shoulder )
			.filter( lane => lane.direction === incomingDirection )
			.map( lane => incoming.toLaneCoord( lane ) );

		const outgoingLaneCoords = outgoing.laneSection.getLanes()
			.filter( lane => lane.type == TvLaneType.driving || lane.type == TvLaneType.shoulder )
			.filter( lane => lane.direction === outgoingDirection )
			.map( lane => outgoing.toLaneCoord( lane ) );

		for ( let i = 0; i < incomingLaneCoords.length; i++ ) {

			const laneCoord = incomingLaneCoords[ i ];

			const link = this.createLink( connection, laneCoord, outgoingLaneCoords );

			if ( !link ) continue;

			connection.addLaneLink( link );
		}

	}

	private addRoadMarks ( connection: TvJunctionConnection ): TvJunctionConnection {

		connection.connectingRoad.laneSections.forEach( laneSection => {

			laneSection.getLanes().forEach( lane => {

				if ( lane.side == TvLaneSide.CENTER ) return;

				const previousLaneId = lane.predecessorId || lane.id;

				const previousLane = connection.incomingRoad.getLaneProfile().getLastLaneSection().getLaneById( previousLaneId );

				if ( previousLane ) {

					const lastRoadMark = previousLane.roadMarks.getLast();

					if ( lastRoadMark ) {
						lane.addRoadMarkInstance( lastRoadMark.clone( 0, lane ) );
					}

				}

			} );

		} );

	}

	private createLink ( connection: TvJunctionConnection, incoming: TvLaneCoord, outgoingLanes: TvLaneCoord[] ) {

		const roadLength = connection.connectingRoad.length;

		let outgoing: TvLaneCoord;

		const outgoingLane = TvLaneSection.getNearestLane( outgoingLanes.map( i => i.lane ), incoming.lane );

		if ( !outgoingLane ) return;

		outgoing = outgoingLanes.find( i => i.lane === outgoingLane );

		if ( !outgoing ) return;

		// check if this outgoing lane is already connected
		const exists = connection.laneLinks.find( link => link.connectingLane.successorId == outgoing.lane.id );

		if ( exists ) return;

		const newLaneId = -Math.abs( incoming.lane.id );

		// avoids adding the same lane twice
		if ( connection.connectingLaneSection.hasLane( newLaneId ) ) return;

		const connectionLane = connection.connectingLaneSection.createLane(
			TvLaneSide.RIGHT,
			newLaneId,
			incoming.lane.type,
			incoming.lane.level,
			true
		);

		connectionLane.setLinks( incoming.lane, outgoing.lane );

		// NOTE: THIS CAN probably be added in road event listener also
		const widhtAtStart = incoming.lane.getWidthValue( incoming.laneDistance );
		const widthAtEnd = outgoing.lane.getWidthValue( outgoing.laneDistance );
		connectionLane.addWidthRecord( 0, widhtAtStart, 0, 0, 0 );
		connectionLane.addWidthRecord( roadLength, widthAtEnd, 0, 0, 0 );
		connectionLane.updateWidthCoefficients();

		return new TvJunctionLaneLink( incoming.lane, connectionLane );

	}

}
