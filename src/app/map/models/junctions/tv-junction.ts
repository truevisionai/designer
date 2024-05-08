/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Box3, Mesh, Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvJunctionController } from './tv-junction-controller';
import { TvJunctionPriority } from './tv-junction-priority';
import { TvRoad } from '../tv-road.model';
import { TvJunctionType } from './tv-junction-type';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvContactPoint } from '../tv-common';
import { TvRoadCoord } from "../TvRoadCoord";
import { TvRoadLinkChildType } from "../tv-road-link-child";
import { TvJunctionBoundary } from 'app/map/junction-boundary/tv-junction-boundary';

export class TvJunction {

	public priorities: TvJunctionPriority[] = [];

	public controllers: TvJunctionController[] = [];

	public connections: Map<number, TvJunctionConnection> = new Map<number, TvJunctionConnection>();

	public position?: Vector3;

	public type: TvJunctionType = TvJunctionType.DEFAULT;

	public mesh: Mesh;

	public boundingBox: Box3;

	public boundary: TvJunctionBoundary;

	constructor ( public name: string, public id: number ) { }

	toString () {
		return `Junction:${ this.id }`;
	}

	getConnections (): TvJunctionConnection[] {
		return Array.from( this.connections.values() );
	}

	removeConnectionById ( id: number ): boolean {

		const connection = this.connections.get( id );

		connection.laneLink.forEach( laneLink => connection.removeLaneLink( laneLink ) );

		return this.connections.delete( id );

	}

	removeConnectingRoad ( road: TvRoad ): void {

		this.connections.forEach( connection => {

			if ( connection.connectingRoadId === road.id ) {

				this.connections.delete( connection.id );
			}

		} );

	}

	removeConnection ( connection: TvJunctionConnection ) {

		this.connections.delete( connection.id );

	}

	private removeConnectionsForRoad ( road: TvRoad ): void {

		this.removeIncomingConnections( road );

		this.removeOutgoingConnections( road );

	}

	getConnectingRoads (): TvRoad[] {

		const connectingRoads: TvRoad[] = [];

		this.connections.forEach( connection => {

			if ( connection.connectingRoad ) {

				connectingRoads.push( connection.connectingRoad );

			}

		} );

		return connectingRoads;

	}

	getIncomingRoads (): TvRoad[] {

		const incomingRoads: TvRoad[] = [];

		this.connections.forEach( connection => {

			if ( connection.incomingRoad ) {

				incomingRoads.push( connection.incomingRoad );

			}

		} );

		return incomingRoads;

	}

	getIncomingSplines (): AbstractSpline[] {

		const splines = [];

		const incomingRoads = this.getIncomingRoads();

		for ( let i = 0; i < incomingRoads.length; i++ ) {

			const incomingRoad = incomingRoads[ i ];

			if ( !splines.includes( incomingRoad.spline ) ) {

				splines.push( incomingRoad.spline );

			}

		}

		return splines;
	}

	getOutgoingRoads (): TvRoad[] {

		const outgoingRoads: TvRoad[] = [];

		this.connections.forEach( connection => {

			if ( connection.outgoingRoad ) {

				outgoingRoads.push( connection.outgoingRoad );

			}

		} );

		return outgoingRoads;

	}

	getRoads (): TvRoad[] {

		const connections = this.getConnections();

		const roads = new Set<TvRoad>();

		for ( let i = 0; i < connections.length; i++ ) {

			const connection = connections[ i ];

			if ( connection.incomingRoad ) {
				roads.add( connection.incomingRoad );
			}

			if ( connection.outgoingRoad ) {
				roads.add( connection.outgoingRoad );
			}

		}

		return [ ...roads ];
	}

	getRoadCoords () {

		const coords: TvRoadCoord[] = [];

		const roads = this.getRoads();

		for ( const road of roads ) {

			if ( road.successor?.elementType == TvRoadLinkChildType.junction && road.successor?.elementId == this.id ) {

				coords.push( road.getEndPosTheta().toRoadCoord( road ) );

			}

			if ( road.predecessor?.elementType == TvRoadLinkChildType.junction && road.predecessor?.elementId == this.id ) {

				coords.push( road.getStartPosTheta().toRoadCoord( road ) );

			}

		}

		return coords;
	}

	private removeIncomingConnections ( road: TvRoad ) {

		this.connections.forEach( connection => {

			if ( connection.incomingRoadId === road.id ) {

				this.connections.delete( connection.id );

			}

		} );

	}

	private removeOutgoingConnections ( road: TvRoad ) {

		this.connections.forEach( connection => {

			if ( connection.outgoingRoadId === road.id ) {

				this.connections.delete( connection.id );

			}

		} );

	}

	getJunctionPriorityCount (): number {

		return this.priorities.length;

	}

	getJunctionControllerCount (): number {

		return this.controllers.length;

	}

	getJunctionPriority ( index: number ) {

		if ( index < this.priorities.length && this.priorities.length > 0 ) {

			return this.priorities[ index ];

		}

		return null;
	}

	getJunctionController ( index: number ) {

		if ( index < this.controllers.length && this.controllers.length > 0 ) {

			return this.controllers[ index ];

		}

		return null;
	}

	addConnection ( connection: TvJunctionConnection ) {

		this.connections.set( connection.id, connection );

	}

	addPriority ( priority: TvJunctionPriority ) {

		this.priorities.push( priority );

	}

	addController ( controller: TvJunctionController ) {

		this.controllers.push( controller );

	}

	getRandomConnectionFor ( incomingRoadId: number, laneId?: number ): TvJunctionConnection {

		const connections = [ ...this.connections.values() ].filter( connection => {

			if ( laneId ) {

				return ( connection.incomingRoadId === incomingRoadId && connection.getToLaneId( laneId ) );

			} else {

				return ( connection.incomingRoadId === incomingRoadId );

			}

		} );

		const randomIndex = Maths.randomNumberBetween( 0, connections.length - 1 );

		return connections[ randomIndex ];
	}

	/**
	 * Checks if the junction has a connection to the given road
	 *
	 * @param incomingRoad
	 * @param outgoingRoad
	 * @returns boolean
	 */
	hasRoadConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad ): boolean {

		return this.findRoadConnection( incomingRoad, outgoingRoad ) !== undefined;

	}

	/**
	 * Find connections to the given incoming and outgoing road
	 *
	 * @param incomingRoad
	 * @param outgoingRoad
	 * @returns {TvJunctionConnection}
	 */
	findRoadConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad ): TvJunctionConnection {

		return this.getConnections()
			.find( conn =>
				conn.incomingRoadId === incomingRoad.id &&
				conn.outgoingRoadId === outgoingRoad.id
			);

	}

	getConnectionsForRoad ( road: TvRoad ): TvJunctionConnection[] {

		const connections = this.getConnections();

		const results = [];

		for ( let i = 0; i < connections.length; i++ ) {

			const connection = connections[ i ];

			if ( connection.connectingRoadId === road.id ) {

				results.push( connection );

			} else if ( connection.incomingRoadId === road.id ) {

				results.push( connection );

			} else if ( connection.outgoingRoadId === road.id ) {

				results.push( connection );

			}

		}

		return results;
	}

	sortConnections (): void {

		this.connections.forEach( connection => connection.sortLinks() );

		const ascOrder = ( a: [ number, TvJunctionConnection ], b: [ number, TvJunctionConnection ] ) => a[ 1 ].id > b[ 1 ].id ? 1 : -1;

		this.connections = new Map( [ ...this.connections.entries() ].sort( ascOrder ) );

	}

	/**
	 * Returns the contact point of outgoing road with this junction
	 *
	 * @param connection
	 * @returns
	 */
	getOutgoingContact ( connection: TvJunctionConnection ): TvContactPoint {

		const outgoingRoad = connection.outgoingRoad;

		if ( !outgoingRoad ) return;

		if ( outgoingRoad.successor?.isJunction && outgoingRoad.successor.elementId == this.id ) {
			return TvContactPoint.END;
		}

		if ( outgoingRoad.predecessor?.isJunction && outgoingRoad.predecessor.elementId == this.id ) {
			return TvContactPoint.START;
		}
	}

	private removeJunctionRelation ( road: TvRoad ): void {

		let hasConnections = false;

		for ( const connection of this.connections ) {

			if ( connection[ 1 ].incomingRoadId === road.id ) {

				hasConnections = true;

			} else if ( connection[ 1 ].outgoingRoad.id === road.id ) {

				hasConnections = true;

			}
		}

		if ( !hasConnections ) {

			if ( road.successor?.isJunction && road.successor.elementId === this.id ) {

				road.successor = null;

			} else if ( road.predecessor?.isJunction && road.predecessor.elementId === this.id ) {

				road.predecessor = null;

			}

		}
	}

}
