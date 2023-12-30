import { Injectable } from '@angular/core';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvRoadCoord } from "../../modules/tv-map/models/TvRoadCoord";
import { TvContactPoint, TvLaneSide, TvLaneType } from "../../modules/tv-map/models/tv-common";
import { TvJunctionConnection } from 'app/modules/tv-map/models/junctions/tv-junction-connection';
import { RoadSplineService } from '../road/road-spline.service';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { RoadService } from '../road/road.service';
import { LaneLinkService } from './lane-link.service';
import { TrafficRule } from 'app/modules/tv-map/models/traffic-rule';
import { MapService } from '../map.service';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionConnectionService {

	constructor (
		private roadService: RoadService,
		private roadSplineService: RoadSplineService,
		private linkService: LaneLinkService,
		private mapService: MapService
	) {
	}

	get connections () {

		return this.mapService.map.getJunctions().flatMap( junction => junction.getConnections() );

	}

	addConnection ( junction: TvJunction, connection: TvJunctionConnection ) {

		junction.addConnection( connection );

		this.roadService.addRoad( connection.connectingRoad );

	}

	removeConnection ( junction: TvJunction, connection: TvJunctionConnection ) {

		junction.removeConnection( connection );

		this.roadService.removeRoad( connection.connectingRoad );

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

		this.roadSplineService.rebuildSplineRoads( connectingRoad.spline );

		this.linkService.createDrivingLinks( connection, incoming, outgoing );

		return connection;
	}

	postProcessConnection ( connection: TvJunctionConnection ): TvJunctionConnection {

		this.linkService.createNonDrivingLinks( connection );

		this.linkService.addRoadMarks( connection );

		return connection;
	}

}
