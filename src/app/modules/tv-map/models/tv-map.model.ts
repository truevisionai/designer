/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { SceneService } from 'app/core/services/scene.service';
import { TvConsole } from 'app/core/utils/console';
import { RoadStyleService } from 'app/services/road-style.service';
import { PropCurve } from './prop-curve';
import { PropPolygon } from './prop-polygons';
import { TvLaneSide, TvLaneType, TvRoadType } from './tv-common';
import { TvController } from './tv-controller';
import { TvJunction } from './tv-junction';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvLane } from './tv-lane';
import { TvMapHeader } from './tv-map-header';
import { TvRoadLinkChild } from './tv-road-link-child';
import { TvRoad } from './tv-road.model';
import { TvSurface } from './tv-surface.model';

export class TvMap {

	public props: PropInstance[] = [];
	public propCurves: PropCurve[] = [];
	public propPolygons: PropPolygon[] = [];
	public surfaces: TvSurface[] = [];

	public gameObject: GameObject = new GameObject( 'OpenDrive' );
	public header: TvMapHeader = new TvMapHeader( 1, 4, 'Untitled', 1, Date(), 1, 0, 0, 0, 'truevision.ai' );

	private _roads: Map<number, TvRoad> = new Map<number, TvRoad>();

	/**
	 * @deprecated use getRoads();
	 */
	get roads (): Map<number, TvRoad> {
		return this._roads;
	}

	getRoads (): TvRoad[] {
		return Array.from( this._roads.values() );
	}

	/**
	 * @deprecated use setRoads()
	 */
	set roads ( value: Map<number, TvRoad> ) {
		this._roads = value;
	}

	private _junctions: Map<number, TvJunction> = new Map<number, TvJunction>();

	get junctions (): Map<number, TvJunction> {
		return this._junctions;
	}

	set junctions ( value: Map<number, TvJunction> ) {
		this._junctions = value;
	}

	private _controllers: Map<number, TvController> = new Map<number, TvController>();

	get controllers (): Map<number, TvController> {
		return this._controllers;
	}

	set controllers ( value: Map<number, TvController> ) {
		this._controllers = value;
	}

	update () {


	}

	public getHeader (): TvMapHeader {
		return this.header;
	}

	public addRoad ( name: string, length: number, id: number, junction: number ): TvRoad {

		const road = new TvRoad( name, length, id, junction );

		this.addRoadInstance( road );

		return road;
	}

	addDefaultRoadWithType ( type: TvRoadType, maxSpeed = 40 ) {

		const road = this.addDefaultRoad();

		road.setType( type, maxSpeed );

		return road;
	}

	addDefaultRoad (): TvRoad {

		const id = TvRoad.counter++;

		const road = this.addRoad( `Road${ id }`, 0, id, -1 );

		const roadStyle = RoadStyleService.getRoadStyle( road );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;
	}

	addRampRoad ( lane: TvLane ): TvRoad {

		const id = TvRoad.counter++;

		const road = this.addRoad( `Road${ id }`, 0, id, -1 );

		road.addElevation( 0, 0.05, 0, 0, 0 );

		const roadStyle = RoadStyleService.getRampRoadStyle( road, lane );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;
	}

	addConnectingRoad ( side: TvLaneSide, width: number, junctionId: number ): TvRoad {

		const id = TvRoad.counter++;

		const road = this.addRoad( `Road${ id }`, 0, id, junctionId );

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

	addConnectingRoadLane () {

	}


	addRoadInstance ( road: TvRoad ) {

		this._roads.set( road.id, road );

	}

	public addNewJunction ( name?: string ): TvJunction {

		const junction = TvJunction.create( name );

		this.junctions.set( junction.id, junction );

		return junction;
	}

	public addController ( id: number, name: string, sequence: number ): TvController {

		const controller = new TvController( id, name, sequence );

		this._controllers.set( id, controller );

		return controller;
	}

	public getControllerCount (): number {

		return this._controllers.size;

	}

	public getController ( index: number ) {

		return this._controllers.get( index );

	}

	public removeRoad ( road: TvRoad ) {

		road.remove( this.gameObject );

		this.roads.delete( road.id );
	}

	public deleteRoad ( id: number ): void {

		this.roads.delete( id );

	}

	public deleteJunction ( id ): void {

		this._junctions.delete( id );

	}

	getRoadById ( roadId: number ): TvRoad {

		if ( this._roads.has( roadId ) ) {

			return this._roads.get( roadId );

		} else {

			TvConsole.error( `${ roadId } road-id not found` );

			throw new Error( `RoadNotFound` );

		}

	}

	public getRoadCount (): number {

		return this._roads.size;

	}

	public getJunctionById ( id ): TvJunction {

		return this._junctions.get( id );

	}

	public getJunctionCount (): number {

		return this._junctions.size;

	}

	/**
	 * Clears the OpenDrive structure, could be used to start a new document
	 */
	public clear () {

		this._roads.clear();

		this._junctions.clear();

		this.props.splice( 0, this.props.length );

		this.propCurves.splice( 0, this.propCurves.length );

		this.surfaces.splice( 0, this.surfaces.length );
	}

	public setHeader (
		revMajor: number,
		revMinor: number,
		name: string,
		version: number,
		date: string,
		north: number,
		south: number,
		east: number,
		west: number,
		vendor: string
	) {

		this.header = new TvMapHeader( revMajor, revMinor, name, version, date, north, south, east, west, vendor );

	}

	addJunctionInstance ( junction: TvJunction ) {

		this._junctions.set( junction.id, junction );

	}

	addControllerInstance ( odController: TvController ) {

		this.controllers.set( odController.id, odController );

	}

	destroy () {

		this.roads.forEach( road => road.remove( this.gameObject ) );

		this.surfaces.forEach( surface => this.gameObject.remove( surface.mesh ) );

		this.propCurves.forEach( curve => {

			this.gameObject.remove( curve.spline.mesh );

			curve.props.forEach( prop => SceneService.remove( prop ) );

		} );

		this.propPolygons.forEach( polygon => polygon.delete() );

		this.props.forEach( prop => this.gameObject.remove( prop.object ) );

		this.clear();
	}

	private getNextRoad ( road: TvRoad, connection: TvJunctionConnection, child: TvRoadLinkChild ) {

		if ( child.elementType == 'road' ) {

			connection = null;

			return this.getRoadById( child.elementId );

		} else if ( child.elementType == 'junction' ) {

			const junction = this.getJunctionById( child.elementId );

			connection = junction.getRandomConnectionFor( road.id );

			return connection?.connectingRoad;

		} else {

			console.error( 'unknown successor type', child );

		}

	}

	showSurfaceHelpers () {
		this.surfaces.forEach( surface => surface.showHelpers() );
	}

	hideSurfaceHelpers () {
		this.surfaces.forEach( surface => surface.hideHelpers() );
	}

	getJunctions () {
		return Array.from( this._junctions.values() );
	}

	removeJunction ( junction: TvJunction ) {
		this._junctions.delete( junction.id );
	}

	sortRoads () {

		const ascOrder = ( a: [ number, TvRoad ], b: [ number, TvRoad ] ) => a[ 1 ].id > b[ 1 ].id ? 1 : -1;

		this._roads = new Map( [ ...this._roads.entries() ].sort( ascOrder ) );
	}

	sortJunctions () {

		this.junctions.forEach( junction => junction.sortConnections() );

		const ascOrder = ( a: [ number, TvJunction ], b: [ number, TvJunction ] ) => a[ 1 ].id > b[ 1 ].id ? 1 : -1;

		this._junctions = new Map( [ ...this._junctions.entries() ].sort( ascOrder ) );
	}


	findJunction ( incoming: TvRoad, outgoing: TvRoad ): TvJunction {

		for ( const junction of this.getJunctions() ) {

			const connections = junction.getConnections();

			for ( let i = 0; i < connections.length; i++ ) {

				const connection = connections[ i ];
				const connectingRoad = this.getRoadById( connection.connectingRoadId );

				if ( connection.incomingRoadId === incoming.id || connection.incomingRoadId === outgoing.id ) {
					return junction;
				}

				if ( connectingRoad?.predecessor.elementId === incoming.id ) {
					return junction;
				}

				if ( connectingRoad?.successor.elementId === outgoing.id ) {
					return junction;
				}
			}
		}
	}
}
