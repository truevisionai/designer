import { Injectable } from '@angular/core';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TrafficRule } from 'app/modules/tv-map/models/traffic-rule';
import { TvRoadCoord } from "../../modules/tv-map/models/TvRoadCoord";
import { TvLane } from "../../modules/tv-map/models/tv-lane";
import { TravelDirection, TvContactPoint, TvLaneSide, TvLaneType } from "../../modules/tv-map/models/tv-common";
import { TvJunctionConnection } from 'app/modules/tv-map/models/tv-junction-connection';
import { RoadFactory } from 'app/factories/road-factory.service';
import { TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvJunctionLaneLink } from 'app/modules/tv-map/models/tv-junction-lane-link';
import { RoadSplineService } from '../road/road-spline.service';
import { MapEvents, RoadCreatedEvent } from 'app/events/map-events';
import { MapService } from '../map.service';
import { SceneService } from '../scene.service';
import { SplineService } from '../spline.service';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvLaneCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';

@Injectable( {
	providedIn: 'root'
} )
export class JunctionConnectionService {

	constructor (
		private roadSplineService: RoadSplineService,
		private mapService: MapService,
		private splineService: SplineService
	) {
	}

	createConnections ( junction: TvJunction, coords: TvRoadCoord[] ) {

		return this.makeConnections( junction, coords );

	}

	createConnectionV2 ( junction: TvJunction, incomingRoad: TvRoad, connectingRoad: TvRoad, contact: TvContactPoint ) {

		const id = junction.connections.size + 1;

		const connection = new TvJunctionConnection( id, incomingRoad, connectingRoad, contact );

		return connection
	}

	connectLaneCoord ( l1: TvLaneCoord, l2: TvLaneCoord ): TvRoad {

		const width = l1.lane.getWidthValue( l1.s );

		const road = RoadFactory.createSingleLaneRoad( width );

		road.spline = this.roadSplineService.createManeuverSpline( l1, l2 );

		// this.mapService.map.addRoad( road );

		// this.roadSplineService.addRoadSegment( road );

		// this.roadSplineService.rebuildSplineRoads( road.spline );

		// TvMapBuilder.rebuildRoad( road );

		// MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) );

		return road;

	}

	private makeConnections ( junction: TvJunction, coords: TvRoadCoord[] ) {

		const connections = new Map<number, Set<number>>();
		const junctionConnections: TvJunctionConnection[] = [];

		for ( let i = 0; i < coords.length; i++ ) {

			const first = coords[ i ];

			for ( let j = i + 1; j < coords.length; j++ ) { // Start from i + 1 to avoid duplicates

				const second = coords[ j ];

				// Skip if same road
				if ( first.roadId === second.roadId ) continue;

				// Ensure the smaller ID is always first to avoid duplicates
				let smaller = Math.min( first.roadId, second.roadId );
				let larger = Math.max( first.roadId, second.roadId );

				// Initialize the set if this is the first connection for this road
				if ( !connections.has( smaller ) ) {
					connections.set( smaller, new Set<number>() );
				}

				// Add the connection if it doesn't exist
				let existingConnections = connections.get( smaller );

				if ( existingConnections && !existingConnections.has( larger ) ) {

					existingConnections.add( larger );

					// Here you can do something with the unique connection, like creating an actual connection object
					junctionConnections.push( this.createConnection( junction, first, second ) );
				}
			}
		}

		// If you need to return the connections from this function, you can convert the map to an array
		// and map it to actual connection objects or whatever format you need
		let result = [];

		for ( let [ smaller, largerSet ] of connections.entries() ) {
			for ( let larger of largerSet ) {
				result.push( {
					road1: smaller,
					road2: larger
				} );
			}
		}

		console.log( result );

		return junctionConnections;
	}

	private createConnection ( junction: TvJunction, incoming: TvRoadCoord, outgoing: TvRoadCoord ) {

		const connectingRoad = RoadFactory.createNewRoad();

		connectingRoad.junctionId = junction.id;

		const spline = this.roadSplineService.createConnectingRoadSpline( incoming, outgoing );

		spline.controlPoints.forEach( cp => connectingRoad.addControlPoint( cp ) );

		const connectingRoadLaneSection = connectingRoad.addGetLaneSection( 0 );

		connectingRoadLaneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, true );

		const connection = new TvJunctionConnection( 0, incoming.road, connectingRoad, TvContactPoint.START, outgoing.road );

		console.log( 'creating connection', incoming, outgoing );

		const direction = incoming.contact !== outgoing.contact ? 1 : -1;

		if ( incoming.contact !== outgoing.contact ) {

			// direction same
			console.log( 'direction same' );

		} else {

			// direction opposite
			console.log( 'direction opposite' )

		}

		this.mapService.map.addRoad( connectingRoad );
		MapEvents.roadCreated.emit( new RoadCreatedEvent( connectingRoad ) );

		if ( incoming.road.trafficRule == TrafficRule.RHT ) {

			const incomingLanes = incoming.laneSection.getLaneArray().filter( lane => lane.direction === TravelDirection.forward );

			let outgoingLanes: TvLane[];

			if ( direction === 1 ) {

				outgoingLanes = outgoing.laneSection.getLaneArray().filter( lane => lane.direction === TravelDirection.forward );

			} else {

				outgoingLanes = outgoing.laneSection.getLaneArray().filter( lane => lane.direction === TravelDirection.backward );

			}

			console.log( incomingLanes, outgoingLanes );

			incomingLanes.forEach( incomingLane => {

				const outgoingLane = outgoingLanes.find( outgoingLane => outgoingLane.id === incomingLane.id );

				const connectionLane = connectingRoadLaneSection.addLane( TvLaneSide.RIGHT, incomingLane.id, TvLaneType.driving, false, true );

				const incomingLaneWidth = incomingLane.getWidthValue( 0 );

				connectionLane.addWidthRecord( 3.6, 0, 0, 0, 0 );

				if ( !outgoingLane ) return;

				const laneLink = new TvJunctionLaneLink( incomingLane, connectionLane );

				connection.addLaneLink( laneLink );

			} )

			console.log( connection );

		} else {

			throw new Error( 'Traffic rule not implemented' );

		}



		this.splineService.showControlPoints( connectingRoad.spline );
		this.splineService.showLines( connectingRoad.spline );

		console.log( connectingRoad.spline.getRoadSegments() );

		return connection;
	}

	createConnectingRoad ( incoming: TvRoadCoord, outgoing: TvRoadCoord ) {

		// const laneWidth = entry.lane.getWidthValue( 0 );

		// const spline = this.createSpline( entry, exit, side );

		// const connectingRoad = this.addConnectingRoad( TvLaneSide.RIGHT, laneWidth, 1 );

		// connectingRoad.setPredecessor( TvRoadLinkChildType.road, incoming.road.id, incoming.contact );

		// connectingRoad.setSuccessor( TvRoadLinkChildType.road, outgoing.road.id, outgoing.contact );

		// // TODO: test this
		// connectingRoad.laneSections.forEach( ( laneSection ) => {

		// 	laneSection.lanes.forEach( ( lane ) => {

		// 		lane.predecessor = entry.lane.id;
		// 		lane.successor = exit.lane.id;

		// 	} );
		// } );

		// connectingRoad.spline = spline;
		// connectingRoad.spline.hide();

		// return connectingRoad;
	}

	addConnectingRoad ( side: TvLaneSide, width: number, junctionId: number ): TvRoad {

		const id = 1;

		const road = new TvRoad( `Road${ id }`, 0, id, junctionId );

		const laneSection = road.addGetLaneSection( 0 );

		if ( side === TvLaneSide.LEFT ) {
			laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );
		}

		if ( side === TvLaneSide.RIGHT ) {
			laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );
		}

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		laneSection.getLaneArray().forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				if ( lane.type === TvLaneType.driving ) lane.addWidthRecord( 0, width, 0, 0, 0 );

			}

		} );

		return road;
	}
}
