/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Box2, Box3, Mesh, Vector2, Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvJunctionController } from './tv-junction-controller';
import { TvJunctionPriority } from './tv-junction-priority';
import { TvRoad } from '../tv-road.model';
import { TvJunctionType } from './tv-junction-type';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvContactPoint } from '../tv-common';
import { TvRoadLink, TvRoadLinkType } from "../tv-road-link";
import { TvJunctionBoundary } from 'app/map/junction-boundary/tv-junction-boundary';
import { DuplicateKeyException, ModelNotFoundException } from 'app/exceptions/exceptions';
import { TvJunctionLaneLink } from './tv-junction-lane-link';

export class TvJunction {

	public priorities: TvJunctionPriority[] = [];

	public controllers: TvJunctionController[] = [];

	public connections: Map<number, TvJunctionConnection> = new Map<number, TvJunctionConnection>();

	public corners: TvJunctionConnection[] = [];

	public centroid?: Vector3;

	public type: TvJunctionType = TvJunctionType.DEFAULT;

	public mesh: Mesh;

	public depBoundingBox: Box3;

	public boundingBox: Box2;

	public outerBoundary: TvJunctionBoundary;

	public innerBoundary: TvJunctionBoundary;

	public auto: boolean = true;

	public needsUpdate: boolean = false;

	constructor ( public name: string, public id: number ) {

		// this.boundingBox = new Box2();

	}

	toString () {
		return `Junction:${ this.id } Connections:${ this.connections.size }`;
	}

	getConnections (): TvJunctionConnection[] {
		return Array.from( this.connections.values() );
	}

	/**
	 * @deprecated use JunctionRoadService
	 */
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

	/**
	 * @deprecated use JunctionRoadService
	 */
	getIncomingSplines (): AbstractSpline[] {

		const splines = new Set<AbstractSpline>();

		this.getIncomingRoads().forEach( road => splines.add( road.spline ) );

		return [ ...splines ];

	}

	/**
	 * @deprecated use JunctionRoadService
	 */
	getRoads (): TvRoad[] {

		return this.getIncomingRoads();

	}

	/**
	 * @deprecated use JunctionRoadService
	 */
	getRoadCoords () {

		return this.getLinks().map( link => link.toRoadCoord() );

	}

	/**
	 * @deprecated use JunctionRoadService
	 */
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

		if ( this.connections.has( connection.id ) ) {
			throw new DuplicateKeyException( `Connection with id ${ connection.id } already exists in junction ${ this.id }` );
		}

		this.connections.set( connection.id, connection );

	}

	removeConnection ( connection: TvJunctionConnection ) {

		if ( !this.connections.has( connection.id ) ) {
			throw new ModelNotFoundException( `Connection with id ${ connection.id } not found in junction ${ this.id }` );
		}

		this.connections.delete( connection.id );

	}

	getConnectionCount (): number {

		return this.connections.size;

	}

	getLaneLinkCount (): number {

		return this.getLaneLinks().length;

	}

	getLaneLinks (): TvJunctionLaneLink[] {

		const links: TvJunctionLaneLink[] = [];

		for ( const connection of this.getConnections() ) {

			for ( const laneLink of connection.laneLink ) {

				links.push( laneLink );

			}

		}

		return links;

	}

	addPriority ( priority: TvJunctionPriority ) {

		this.priorities.push( priority );

	}

	containsPoint ( position: Vector3 ): boolean {

		return this.boundingBox.containsPoint( new Vector2( position.x, position.z ) );

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

	clone () {

		const junction = new TvJunction( this.name, this.id );

		junction.type = this.type;

		junction.auto = this.auto;

		junction.needsUpdate = this.needsUpdate;

		junction.centroid = this.centroid?.clone();

		junction.mesh = this.mesh.clone();

		junction.depBoundingBox = this.depBoundingBox.clone();

		junction.boundingBox = this.boundingBox.clone();

		junction.outerBoundary = this.outerBoundary.clone();

		junction.innerBoundary = this.innerBoundary.clone();

		this.priorities.forEach( priority => junction.addPriority( priority.clone() ) );

		this.controllers.forEach( controller => junction.controllers.push( controller.clone() ) );

		this.connections.forEach( connection => junction.connections.set( connection.id, connection.clone() ) );

		return junction;

	}
}
