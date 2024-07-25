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
import { TvRoadLink, TvRoadLinkType } from "../tv-road-link";
import { TvJunctionBoundary } from 'app/map/junction-boundary/tv-junction-boundary';

export class TvJunction {

	public priorities: TvJunctionPriority[] = [];

	public controllers: TvJunctionController[] = [];

	public connections: Map<number, TvJunctionConnection> = new Map<number, TvJunctionConnection>();

	public corners: TvJunctionConnection[] = [];

	public position?: Vector3;

	public type: TvJunctionType = TvJunctionType.DEFAULT;

	public mesh: Mesh;

	public boundingBox: Box3;

	public boundary: TvJunctionBoundary;

	public auto: boolean = true;

	constructor ( public name: string, public id: number ) {
	}

	toString () {
		return `Junction:${ this.id }`;
	}

	getConnections (): TvJunctionConnection[] {
		return Array.from( this.connections.values() );
	}

	removeConnectingRoad ( road: TvRoad ): void {

		this.connections.forEach( connection => {

			if ( connection.connectingRoadId === road.id ) {

				this.connections.delete( connection.id );
			}

		} );

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

		const roads = new Set<TvRoad>();

		this.connections.forEach( connection => {

			if ( connection.connectingRoad?.predecessor?.isRoad ) {
				roads.add( connection.connectingRoad.predecessor.element as TvRoad );
			}

			if ( connection.connectingRoad?.successor?.isRoad ) {
				roads.add( connection.connectingRoad.successor.element as TvRoad );
			}

		} );

		return [ ...roads ];

	}

	getIncomingSplines (): AbstractSpline[] {

		const splines = new Set<AbstractSpline>();

		this.getIncomingRoads().forEach( road => splines.add( road.spline ) );

		return [ ...splines ];
	}

	getRoads (): TvRoad[] {

		return this.getIncomingRoads();

	}

	getRoadCoords () {

		return this.getLinks().map( link => link.toRoadCoord() );

	}

	getLinks (): TvRoadLink[] {

		const edges: TvRoadLink[] = [];

		const roads = this.getRoads();

		for ( const road of roads ) {

			if ( road.geometries.length == 0 ) continue;

			if ( road.successor?.type == TvRoadLinkType.JUNCTION && road.successor?.id == this.id ) {

				edges.push( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.END ) );

			}

			if ( road.predecessor?.type == TvRoadLinkType.JUNCTION && road.predecessor?.id == this.id ) {

				edges.push( new TvRoadLink( TvRoadLinkType.ROAD, road, TvContactPoint.START ) );

			}

		}

		return edges;
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

	static stringToType ( value: string ): TvJunctionType {

		switch ( value ) {

			case "default":
				return TvJunctionType.DEFAULT;

			case "virtual":
				return TvJunctionType.VIRTUAL;

			case "direct":
				return TvJunctionType.DIRECT;

			default:
				return TvJunctionType.DEFAULT;

		}

	}

	static typeToString ( value: TvJunctionType ): string {

		switch ( value ) {

			case TvJunctionType.DEFAULT:
				return "default";

			case TvJunctionType.VIRTUAL:
				return "virtual";

			case TvJunctionType.DIRECT:
				return "direct";

			default:
				return "default";

		}

	}

}
