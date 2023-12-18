import { Injectable } from '@angular/core';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TrafficRule } from 'app/modules/tv-map/models/traffic-rule';
import { TvRoadCoord } from "../../modules/tv-map/models/TvRoadCoord";
import { TravelDirection, TvContactPoint, TvLaneSide, TvLaneType } from "../../modules/tv-map/models/tv-common";
import { TvJunctionConnection } from 'app/modules/tv-map/models/junctions/tv-junction-connection';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/junctions/tv-junction-lane-link';
import { RoadSplineService } from '../road/road-spline.service';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { RoadService } from '../road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionConnectionService {

	constructor (
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
	) {
	}

	createConnectionV2 ( junction: TvJunction, incomingRoad: TvRoad, connectingRoad: TvRoad, contact: TvContactPoint, outgoingRoad?: TvRoad ) {

		const id = junction.connections.size + 1;

		const connection = new TvJunctionConnection( id, incomingRoad, connectingRoad, contact, outgoingRoad );

		return connection
	}

	connectLaneCoord ( coordA: TvLaneCoord, coordB: TvLaneCoord ): TvRoad {

		const width = coordA.lane.getWidthValue( coordA.s );

		const road = this.roadService.createSingleLaneRoad( width );

		road.spline = this.roadSplineService.createManeuverSpline( coordA, coordB );

		return road;

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

		// // If you need to return the connections from this function, you can convert the map to an array
		// // and map it to actual connection objects or whatever format you need
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

	createConnection ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ) {

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

		if ( incoming.road.trafficRule == TrafficRule.LHT ) {
			throw new Error( 'Traffic rule not implemented' );
		}

		const incomingLanes = incoming.laneSection.getLaneArray().filter( lane => lane.direction === TravelDirection.forward );

		const outgoingDirection = incoming.contact !== outgoing.contact ? TravelDirection.forward : TravelDirection.backward;

		const outgoingLanes = outgoing.laneSection.getLaneArray().filter( lane => lane.direction === outgoingDirection );

		for ( let i = 0; i < incomingLanes.length; i++ ) {

			const incomingLane = incomingLanes[ i ];

			const outgoingLane = outgoingLanes.find( outgoingLane => Math.abs( outgoingLane.id ) === Math.abs( incomingLane.id ) );

			const connectionLane = laneSection.addLane(
				incomingLane.side,
				incomingLane.id,
				incomingLane.type,
				incomingLane.level,
				true
			);

			const incomingLaneWidth = incomingLane.getWidthValue( incoming.s ) || incomingLane.getWidthValue( 0 );

			connectionLane.addWidthRecord( 0, incomingLaneWidth, 0, 0, 0 );

			if ( !outgoingLane ) continue;

			const laneLink = new TvJunctionLaneLink( incomingLane, connectionLane );

			connection.addLaneLink( laneLink );

		}

		return connection;
	}

}
