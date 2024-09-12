import { Injectable } from '@angular/core';
import { TvJunction } from "../models/junctions/tv-junction";
import { TvJunctionConnection } from "../models/junctions/tv-junction-connection";
import { TvRoad } from "../models/tv-road.model";
import { GeometryUtils } from "../../services/surface/geometry-utils";
import { JunctionRoadService } from "../../services/junction/junction-road.service";
import { TvRoadCoord } from '../models/TvRoadCoord';

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionCornerRoadService {

	constructor (
		private junctionRoadService: JunctionRoadService
	) { }

	getJunctionCornerConnections ( junction: TvJunction ): TvJunctionConnection[] {

		return this.getConnections( junction, this.getCornerConnectionForRoad.bind( this ) );

	}

	getCarriagewayConnections ( junction: TvJunction ): TvJunctionConnection[] {

		return this.getConnections( junction, this.getInnerConnectionForRoad.bind( this ) );

	}

	getCornerConnectionForRoad ( junction: TvJunction, incomingRoad: TvRoad ): TvJunctionConnection {

		const rightRoadCoord = this.getAdjacentRoadToRight( junction, incomingRoad );

		const rightConnections = junction.getConnectionsBetween( incomingRoad, rightRoadCoord.road );

		return this.getConnectionWithOutermostLane( rightConnections );

	}

	getInnerConnectionForRoad ( junction: TvJunction, incomingRoad: TvRoad ): TvJunctionConnection {

		const rightRoadCoord = this.getAdjacentRoadToRight( junction, incomingRoad );

		const rightConnections = junction.getConnectionsBetween( incomingRoad, rightRoadCoord.road );

		return this.getOuterMostCarriagewayConnection( rightConnections );

	}

	private getConnections ( junction: TvJunction, callbackFunction: ( junction: TvJunction, road: TvRoad ) => TvJunctionConnection ): TvJunctionConnection[] {

		const connections = [];

		const links = this.junctionRoadService.getRoadLinks( junction );

		const coords = links.map( link => link.toRoadCoord() );

		coords.forEach( coord => {

			connections.push( callbackFunction( junction, coord.road ) );

		} );

		return connections;
	}

	getAdjacentRoadToRight ( junction: TvJunction, incomingRoad: TvRoad ): TvRoadCoord {

		const coords = this.junctionRoadService.getRoadLinks( junction ).map( link => link.toRoadCoord() );

		const sortedRoadLinks = GeometryUtils.sortCoordsByAngle( coords );

		const incomingRoadIndex = sortedRoadLinks.findIndex( coord => coord.road == incomingRoad );

		const rightRoadIndex = ( incomingRoadIndex + 1 ) % sortedRoadLinks.length;

		return sortedRoadLinks[ rightRoadIndex ];

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

			const laneIds = connection.getLinks()
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
