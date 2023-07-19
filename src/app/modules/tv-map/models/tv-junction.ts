/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvContactPoint } from './tv-common';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvJunctionController } from './tv-junction-controller';
import { TvJunctionPriority } from './tv-junction-priority';
import { TvRoad } from './tv-road.model';

export class TvJunction {

	public position?: Vector3;
	private lastAddedJunctionConnectionIndex: number;
	private lastAddedJunctionPriorityIndex: number;
	private lastAddedJunctionControllerIndex: number;

	private _name: string;
	private _id: number;
	private _priorities: TvJunctionPriority[] = [];
	private _controllers: TvJunctionController[] = [];
	private _connections: Map<number, TvJunctionConnection> = new Map<number, TvJunctionConnection>();

	static counter: number = 1;

	constructor ( name: string, id: number ) {
		this._name = name;
		this._id = id;
	}

	static create ( name?: string ) {

		const id = TvJunction.counter++;

		return new TvJunction( name || `Junction-${ id }`, id );
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

	/**
	 * Adds a junction connection to the junction
	 *
	 * @param id ID within the junction
	 * @param incomingRoad ID of the incoming road
	 * @param connectingRoad ID of the connecting path
	 * @param contactPoint Contact point on the connecting road (start or end)
	 */
	public addJunctionConnection (
		id: number,
		incomingRoad: number,
		connectingRoad: number,
		contactPoint: TvContactPoint
	): TvJunctionConnection {

		const connection = new TvJunctionConnection( id, incomingRoad, connectingRoad, contactPoint );

		this._connections.set( id, connection );

		return connection;
	}

	/**
	 * Adds a junction connection to the junction
	 *
	 * @param incomingRoad ID of the incoming road
	 * @param connectingRoad ID of the connecting path
	 * @param contactPoint Contact point on the connecting road (start or end)
	 */
	public addNewConnection (
		incomingRoad: number,
		connectingRoad: number,
		contactPoint: TvContactPoint,
	): TvJunctionConnection {

		const id = this.connections.size + 1;

		return this.addJunctionConnection( id, incomingRoad, connectingRoad, contactPoint );
	}

	removeConnectionByUuid ( uuid: string ) {

		throw new Error( 'method not implemented' );

	}

	removeConnectionById ( id: number ): boolean {

		const connection = this.connections.get( id );

		connection.laneLink.forEach( laneLink => connection.removeLink( laneLink ) );

		return this.connections.delete( id );

	}

	removeConnectingRoad ( road: TvRoad ): void {

		this.connections.forEach( connection => {

			if ( connection.connectingRoadId === road.id ) {

				this.removeConnectionById( connection.id );

			}

		} )

	}

	removeConnection ( connection: TvJunctionConnection, incomingRoad: TvRoad, outgoingRoad: TvRoad ) {

		if ( this.removeConnectionById( connection.id ) ) {

			this.removeJunctionRelation( incomingRoad );

			this.removeJunctionRelation( outgoingRoad );

		}

	}

	/**
	 * Adds a priority parameter to the junction
	 *
	 * @param {number} high ID of the connecting road with higher priority
	 * @param {number} low ID of the connecting road with lower priority
	 * @returns {number}
	 */
	public addJunctionPriority ( high: number, low: number ): TvJunctionPriority {

		const priority = new TvJunctionPriority( high, low );

		this._priorities.push( priority );

		return priority;
	}

	/**
	 * Adds a controller to the junction
	 *
	 * @param {number} id ID of the controller to add
	 * @param {string} type Type of control
	 * @returns {number}
	 */
	public addJunctionController ( id: number, type: string ): TvJunctionController {

		const controller = new TvJunctionController( id, type );

		this._controllers.push( controller );

		return controller;
	}

	public closeJunctionConnection ( index ) {

		// TODO:

	}

	public closeJunctionPriority ( index ) {

		// TODO:

	}

	public closeJunctionController ( index ) {

		// TODO:

	}

	public deleteJunctionConnection ( id: number ): void {

		this._connections.delete( id );

	}

	public deleteJunctionPriority ( index: number ): void {

		this._priorities.splice( index, 1 );

	}

	public deleteJunctionController ( index: number ): void {

		this._controllers.splice( index, 1 );

	}

	public getJunctionPriorities (): TvJunctionPriority[] {

		return this._priorities;

	}

	public getJunctionControllers (): TvJunctionController[] {

		return this._controllers;

	}

	public getJunctionConnectionCount (): number {

		return this._connections.size;

	}

	public getJunctionPriorityCount (): number {

		return this._priorities.length;

	}

	public getJunctionControllerCount (): number {

		return this._controllers.length;

	}


	public getJunctionConnection ( id: number ) {

		return this.connections.get( id );

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

	public getLastAddedJunctionConnection () {

		if ( this.lastAddedJunctionConnectionIndex < this._connections.size ) {

			return this._connections[ this.lastAddedJunctionConnectionIndex ];

		}

		return null;
	}

	public getLastAddedJunctionPriority () {

		if ( this.lastAddedJunctionPriorityIndex < this._priorities.length ) {

			return this._priorities[ this.lastAddedJunctionPriorityIndex ];

		}

		return null;
	}

	public getLastAddedJunctionController () {

		if ( this.lastAddedJunctionConnectionIndex < this._controllers.length ) {

			return this._controllers[ this.lastAddedJunctionConnectionIndex ];

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

	/**
	 * Checks if the junction has a connection to the given road
	 *
	 * @param incomingRoad
	 * @param outgoingRoad
	 * @returns boolean
	 */
	public hasConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad ): boolean {

		return this.findConnection( incomingRoad, outgoingRoad ) !== undefined;

	}

	/**
	 * Find the connection to the given incoming and outgoing road
	 *
	 * @param incomingRoad
	 * @param outgoingRoad
	 * @returns {TvJunctionConnection}
	 */
	public findConnection ( incomingRoad: TvRoad, outgoingRoad: TvRoad ): TvJunctionConnection {

		return this.getConnections().find( conn =>
			conn.incomingRoadId === incomingRoad.id && conn.outgoingRoad.id === incomingRoad.id
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


}

