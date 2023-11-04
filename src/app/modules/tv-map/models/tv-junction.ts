/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvJunctionController } from './tv-junction-controller';
import { TvJunctionPriority } from './tv-junction-priority';
import { TvRoad } from './tv-road.model';
import { TvOrientation } from './tv-common';

export enum JunctionType {
	DEFAULT = 'default',
	VIRTUAL = 'virtual',
	DIRECT = 'direct',
}

export class TvJunction {

	private _id: number;
	private _name: string;
	private _priorities: TvJunctionPriority[] = [];
	private _controllers: TvJunctionController[] = [];
	private _connections: Map<number, TvJunctionConnection> = new Map<number, TvJunctionConnection>();

	public position?: Vector3;
	public type: JunctionType = JunctionType.DEFAULT;

	constructor ( name: string, id: number ) {
		this._name = name;
		this._id = id;
	}

	get name (): string {
		return this._name;
	}

	set name ( value: string ) {
		this._name = value;
	}

	get id (): number {
		return this._id;
	}

	set id ( value: number ) {
		this._id = value;
	}

	get priorities (): TvJunctionPriority[] {
		return this._priorities;
	}

	set priorities ( value: TvJunctionPriority[] ) {
		this._priorities = value;
	}

	get controllers (): TvJunctionController[] {
		return this._controllers;
	}

	set controllers ( value: TvJunctionController[] ) {
		this._controllers = value;
	}

	get connections (): Map<number, TvJunctionConnection> {
		return this._connections;
	}

	set connections ( value: Map<number, TvJunctionConnection> ) {
		this._connections = value;
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

	public getJunctionPriorityCount (): number {

		return this._priorities.length;

	}

	public getJunctionControllerCount (): number {

		return this._controllers.length;

	}

	public getJunctionPriority ( index: number ) {

		if ( index < this._priorities.length && this._priorities.length > 0 ) {

			return this._priorities[ index ];

		}

		return null;
	}

	public getJunctionController ( index: number ) {

		if ( index < this._controllers.length && this._controllers.length > 0 ) {

			return this._controllers[ index ];

		}

		return null;
	}

	addConnection ( connection: TvJunctionConnection ) {

		this._connections.set( connection.id, connection );

	}

	addPriority ( priority: TvJunctionPriority ) {

		this._priorities.push( priority );

	}

	addController ( controller: TvJunctionController ) {

		this._controllers.push( controller );

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
	public hasRoadConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad ): boolean {

		return this.findRoadConnection( incomingRoad, outgoingRoad ) !== undefined;

	}

	/**
	 * Find connections to the given incoming and outgoing road
	 *
	 * @param incomingRoad
	 * @param outgoingRoad
	 * @returns {TvJunctionConnection}
	 */
	public findRoadConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad ): TvJunctionConnection {

		return this.getConnections()
			.find( conn =>
				conn.incomingRoadId === incomingRoad.id &&
				conn.outgoingRoadId === outgoingRoad.id
			);

	}

	getConnectionsForRoad ( road: TvRoad ): TvJunctionConnection[] {

		return this.getConnections().filter( connection => connection.connectingRoadId === road.id );

	}

	sortConnections (): void {

		this._connections.forEach( connection => connection.sortLinks() );

		const ascOrder = ( a: [ number, TvJunctionConnection ], b: [ number, TvJunctionConnection ] ) => a[ 1 ].id > b[ 1 ].id ? 1 : -1;

		this._connections = new Map( [ ...this._connections.entries() ].sort( ascOrder ) );

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

			if ( road.successor && road.successor.elementType === 'junction' && road.successor.elementId === this.id ) {

				road.successor = null;

			} else if ( road.predecessor && road.predecessor.elementType === 'junction' && road.predecessor.elementId === this.id ) {

				road.predecessor = null;

			}

		}
	}

}

export class TvVirtualJunction extends TvJunction {

	// type="virtual" id="555" mainRoad="1" sStart="50" sEnd="70" orientation="+"
	public type: JunctionType = JunctionType.VIRTUAL;
	public mainRoadId: number;
	public sStart: number;
	public sEnd: number;
	public orientation: TvOrientation;

	constructor ( name: string, id: number, mainRoadId: number, sStart: number, sEnd: number, orientation: TvOrientation ) {
		super( name, id );
		this.mainRoadId = mainRoadId;
		this.sStart = sStart;
		this.sEnd = sEnd;
		this.orientation = orientation;
	}
}
