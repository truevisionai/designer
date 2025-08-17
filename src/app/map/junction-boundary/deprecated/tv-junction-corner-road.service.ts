/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from "../../models/junctions/tv-junction";
import { TvJunctionConnection } from "../../models/connections/tv-junction-connection";
import { TvRoad } from "../../models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionCornerRoadService {

	constructor () { }

	getJunctionCornerConnections ( junction: TvJunction ): TvJunctionConnection[] {

		return this.getConnections( junction, this.getCornerConnectionForRoad.bind( this ) );

	}

	getCornerConnectionForRoad ( junction: TvJunction, incomingRoad: TvRoad ): TvJunctionConnection {

		const rightRoadCoord = junction.getAdjacentRoadCoord( incomingRoad );

		// const cornerConnections = junction.getConnectionsBetween( incomingRoad, rightRoadCoord.road )
			// .filter( connection => connection.isCorner() || connection.hasSidewalks() );

		// return junction.findCornerConnection( incomingRoad, rightRoadCoord.road );

		// return this.getConnectionWithOutermostLane( cornerConnections );

		const rightConnections = junction.getConnectionsBetween( incomingRoad, rightRoadCoord.road );

		return this.getConnectionWithOutermostLane( rightConnections );

	}

	getInnerConnectionForRoad ( junction: TvJunction, incomingRoad: TvRoad ): TvJunctionConnection {

		const rightRoadCoord = junction.getAdjacentRoadCoord( incomingRoad );

		const rightConnections = junction.getConnectionsBetween( incomingRoad, rightRoadCoord.road );

		return this.getOuterMostCarriagewayConnection( rightConnections );

	}

	private getConnections ( junction: TvJunction, callbackFunction: ( junction: TvJunction, road: TvRoad ) => TvJunctionConnection ): TvJunctionConnection[] {

		const connections = [];

		const links = junction.getRoadLinks();

		const coords = links.map( link => link.toRoadCoord() );

		coords.forEach( coord => {

			const connection = callbackFunction( junction, coord.road );

			if ( connection ) connections.push( connection );

		} );

		return connections;
	}

	private getConnectionWithOutermostLane ( connections: TvJunctionConnection[] ): TvJunctionConnection {

		return this.findConnectionByLaneId( connections, true );

	}

	private getOuterMostCarriagewayConnection ( connections: TvJunctionConnection[] ): TvJunctionConnection {

		return this.findConnectionByLaneId( connections, false );

	}

	private findConnectionByLaneId ( connections: TvJunctionConnection[], allLanes: boolean ): TvJunctionConnection {

		let outerConnection: TvJunctionConnection | null = null;
		let maxDistanceFromZero: number = -Infinity;

		for ( const connection of connections ) {

			const laneIds = connection.getLaneLinks()
				.filter( link => allLanes || link.incomingLane.isCarriageWay() )
				.map( link => link.incomingLane.id );

			const farthestLaneId = laneIds.reduce( ( acc, id ) => Math.abs( id ) > Math.abs( acc ) ? id : acc, 0 );

			if ( Math.abs( farthestLaneId ) > maxDistanceFromZero ) {
				outerConnection = connection;
				maxDistanceFromZero = Math.abs( farthestLaneId );
			}

		}

		return outerConnection!;
	}
}
