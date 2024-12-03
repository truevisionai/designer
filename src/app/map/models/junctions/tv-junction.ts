/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Box2, MathUtils, Mesh, Vector2, Vector3 } from 'three';
import { Maths } from '../../../utils/maths';
import { TvJunctionConnection } from '../connections/tv-junction-connection';
import { TvJunctionController } from './tv-junction-controller';
import { TvJunctionPriority } from './tv-junction-priority';
import { TvRoad } from '../tv-road.model';
import { TvJunctionType } from './tv-junction-type';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvContactPoint } from '../tv-common';
import { TvLink } from "../tv-link";
import { LinkFactory } from '../link-factory';
import { TvJunctionBoundary } from 'app/map/junction-boundary/tv-junction-boundary';
import { ModelNotFoundException } from 'app/exceptions/exceptions';
import { TvJunctionLaneLink } from './tv-junction-lane-link';
import { Log } from 'app/core/utils/log';
import { TvJunctionBoundingBox } from './tv-junction-bounding-box';
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { TvMap } from '../tv-map.model';
import { TvJunctionBoundaryService } from 'app/map/junction-boundary/tv-junction-boundary.service';
import { MapEvents } from 'app/events/map-events';


export class TvJunction {

	public priorities: TvJunctionPriority[] = [];

	public controllers: TvJunctionController[] = [];

	public corners: TvJunctionConnection[] = [];

	public centroid: Vector3;

	public type: TvJunctionType;

	public mesh: Mesh;

	public outerBoundary: TvJunctionBoundary;
	public innerBoundary: TvJunctionBoundary;

	private junctionBoundingBox: TvJunctionBoundingBox;

	public needsUpdate: boolean = false;

	private connections: Map<number, TvJunctionConnection> = new Map<number, TvJunctionConnection>();

	private map: TvMap;

	private uuid: string;

	protected constructor ( public name: string, public id: number ) {

		this.uuid = MathUtils.generateUUID();

		this.centroid = new Vector3();

		this.junctionBoundingBox = new TvJunctionBoundingBox( this );

	}

	get auto (): boolean {
		return this.type === TvJunctionType.AUTO;
	}

	get boundingBox (): Box2 {
		return this.junctionBoundingBox.getBox();
	}

	set boundingBox ( box: Box2 ) {
		this.junctionBoundingBox.setBox( box );
	}

	setMap ( map: TvMap ): void {
		this.map = map;
	}

	getMap (): TvMap {
		return this.map;
	}

	getBoundingBox (): Box2 {
		return this.boundingBox;
	}

	equals ( junction: TvJunction ): boolean {
		return junction instanceof TvJunction && this.uuid === junction.uuid;
	}

	toString (): string {
		return `Junction:${ this.id } Connections:${ this.connections.size }`;
	}

	getConnections (): TvJunctionConnection[] {
		return Array.from( this.connections.values() );
	}

	getIncomingRoadCount (): number {
		return this.getIncomingRoads().length
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

		return Array.from( roads );

	}

	getConnectingRoads (): TvRoad[] {

		return this.getConnections().map( connection => connection.connectingRoad );

	}

	getIncomingSplines (): AbstractSpline[] {

		const splines = new Set<AbstractSpline>();

		this.getIncomingRoads().forEach( road => splines.add( road.spline ) );

		return [ ...splines ];

	}

	getRoadCoords (): import("/Users/himanshu/Code/designer-private/src/app/map/models/TvRoadCoord").TvRoadCoord[] {

		return this.getRoadLinks().map( link => link.toRoadCoord() );

	}

	getRoadLinks (): TvLink[] {

		const links: TvLink[] = [];

		const incomingRoads = this.getIncomingRoads();

		for ( const road of incomingRoads ) {

			if ( road.geometries.length == 0 ) continue;

			if ( road.successor?.equals( this ) ) {
				links.push( LinkFactory.createRoadLink( road, TvContactPoint.END ) );
			}

			if ( road.predecessor?.equals( this ) ) {
				links.push( LinkFactory.createRoadLink( road, TvContactPoint.START ) );
			}

		}

		return links;
	}

	getJunctionPriorityCount (): number {

		return this.priorities.length;

	}

	getJunctionControllerCount (): number {

		return this.controllers.length;

	}

	getJunctionPriority ( index: number ): TvJunctionPriority {

		if ( index < this.priorities.length && this.priorities.length > 0 ) {

			return this.priorities[ index ];

		}

		return null;
	}

	addController ( controller: TvJunctionController ): void {

		if ( this.controllers.find( c => c.id === controller.id ) ) {
			Log.error( `Controller with id ${ controller.id } already exists in junction ${ this.id }` );
		}

		while ( this.controllers.find( c => c.sequence === controller.sequence ) ) {
			controller.sequence++;
		}

		this.controllers.push( controller );
	}

	getJunctionController ( index: number ): TvJunctionController {

		if ( index < this.controllers.length && this.controllers.length > 0 ) {
			return this.controllers[ index ];
		}

		return null;
	}

	clearConnections (): void {

		this.connections.clear();

	}

	getConnection ( id: number ): TvJunctionConnection {

		return this.connections.get( id );

	}

	hasConnection ( connection: TvJunctionConnection | number ): boolean {

		if ( typeof connection === 'number' ) {
			return this.connections.has( connection );
		}

		return this.connections.has( connection.id );

	}

	hasMatchingConnection ( connection: TvJunctionConnection ): boolean {

		return this.getConnections().find( c => c.matches( connection ) ) != undefined;

	}

	addConnection ( connection: TvJunctionConnection ): void {

		while ( this.hasConnection( connection ) ) {
			connection.id++;
		}

		connection.setJunction( this );

		this.connections.set( connection.id, connection );
	}

	removeConnection ( connection: TvJunctionConnection ): void {

		if ( !this.hasConnection( connection ) ) {
			throw new ModelNotFoundException( `Connection with id ${ connection.id } not found in junction ${ this.id }` );
		}

		this.connections.delete( connection.id );

		if ( this.map.hasRoad( connection.connectingRoad ) ) {
			this.map.removeRoad( connection.connectingRoad );
		}

		if ( this.map.hasSpline( connection.spline ) ) {
			this.map.removeSpline( connection.spline );
		}

		MapEvents.removeMesh.emit( connection.connectingRoad );
		MapEvents.removeMesh.emit( connection.spline );

	}

	removeConnections ( connections: TvJunctionConnection[] ): void {

		connections.forEach( connection => this.removeConnection( connection ) );

	}

	removeAllConnections (): void {

		return this.removeConnections( this.getConnections() );

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

			for ( const laneLink of connection.getLaneLinks() ) {

				links.push( laneLink );

			}

		}

		return links;

	}

	addPriority ( priority: TvJunctionPriority ): void {

		this.priorities.push( priority );

	}

	containsPoint ( target: Vector2 | Vector3 ): boolean {

		if ( target instanceof Vector3 ) {

			return this.boundingBox.containsPoint( new Vector2( target.x, target.z ) );

		} else {

			return this.boundingBox.containsPoint( target );

		}

	}

	getConnectionsBetween ( incomingRoad: TvRoad, outgoingRoad: TvRoad ): TvJunctionConnection[] {

		const connections: TvJunctionConnection[] = [];

		for ( const connection of this.getConnections() ) {

			if (
				connection.isLinkedToRoad( incomingRoad ) &&
				connection.isLinkedToRoad( outgoingRoad )
			) {
				connections.push( connection );
			}

		}

		return connections;

	}

	getConnectionsByRoad ( targetRoad: TvRoad ): TvJunctionConnection[] {

		const connections = new Set<TvJunctionConnection>();

		for ( const connection of this.getConnections() ) {

			if ( connection.isLinkedToRoad( targetRoad ) ) {

				connections.add( connection );

			}

		}

		return Array.from( connections );

	}

	getRandomConnectionFor ( incomingRoadId: number, laneId?: number ): TvJunctionConnection {

		const connections = [ ...this.connections.values() ].filter( connection => {

			if ( laneId ) {

				return ( connection.incomingRoadId === incomingRoadId && connection.getConnectingLaneId( laneId ) );

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

			case "auto":
				return TvJunctionType.AUTO;

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

	clone (): TvJunction {

		const junction = new TvJunction( this.name, this.id );

		junction.type = this.type;

		junction.needsUpdate = this.needsUpdate;

		junction.centroid = this.centroid?.clone();

		junction.mesh = this.mesh.clone();

		junction.boundingBox = this.boundingBox.clone();

		junction.outerBoundary = this.outerBoundary.clone();

		junction.innerBoundary = this.innerBoundary.clone();

		this.priorities.forEach( priority => junction.addPriority( priority.clone() ) );

		this.controllers.forEach( controller => junction.controllers.push( controller.clone() ) );

		this.connections.forEach( connection => junction.connections.set( connection.id, connection.clone() ) );

		return junction;

	}

	getKey (): string {
		return this.getIncomingSplines().map( s => s.uuid ).sort().join( '_' );
	}

	replaceIncomingRoad ( targetRoad: TvRoad, incomingRoad: TvRoad, incomingRoadContact: TvContactPoint ): void {

		const connections = this.getConnectionsByRoad( targetRoad );

		for ( const connection of connections ) {
			connection.replaceIncomingRoad( targetRoad, incomingRoad, incomingRoadContact );
		}

	}

	removeConnectionsByRoad ( road: TvRoad ): void {
		this.getConnectionsByRoad( road ).forEach( connection => this.removeConnection( connection ) );
	}

	distanceToPoint ( target: Vector2 ): number {
		return this.boundingBox.distanceToPoint( target );
	}

	updatePositionAndBounds (): void {
		this.updateBoundingBox()
		this.updateCentroid();
	}

	private updateBoundingBox (): void {
		this.junctionBoundingBox.update();
	}

	private updateCentroid (): void {
		const centroid = this.boundingBox.getCenter( new Vector2() );
		this.centroid.x = centroid.x;
		this.centroid.y = centroid.y;
	}

	getSplineIntersections (): SplineIntersection[] {
		return [];
	}

	updateFromIntersections (): void {
		//
	}

	removeSpline ( spline: AbstractSpline ): void {
		//
	}

	updateBoundary (): void {
		TvJunctionBoundaryService.instance.update( this );
	}

}


