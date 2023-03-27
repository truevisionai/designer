/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/core/game-object';
import { PropInstance } from 'app/core/models/prop-instance.model';
import { SceneService } from 'app/core/services/scene.service';
import { RoadStyleService } from 'app/services/road-style.service';
import { PropCurve } from './prop-curve';
import { PropPolygon } from './prop-polygons';
import { TvLaneSide, TvLaneType, TvRoadType } from './tv-common';
import { TvController } from './tv-controller';
import { TvJunction } from './tv-junction';
import { TvJunctionConnection } from './tv-junction-connection';
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

	get roads (): Map<number, TvRoad> {
		return this._roads;
	}

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

		const index = this.getRoadCount();

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

		const road = this.addRoad( `${ this.roads.size + 1 }`, 0, this.roads.size + 1, -1 );

		const roadStyle = RoadStyleService.getRoadStyle( road.id );

		// const laneOffset = road.addLaneOffset( 0, 0, 0, 0, 0 );
		const laneOffset = road.addLaneOffsetInstance( roadStyle.laneOffset );

		// const laneSection = road.addGetLaneSection( 0 );
		const laneSection = road.addLaneSectionInstance( roadStyle.laneSection );

		// const leftLane3 = laneSection.addLane( TvLaneSide.LEFT, 3, TvLaneType.sidewalk, true, true );
		// const leftLane2 = laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.shoulder, true, true );
		// const leftLane1 = laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
		// const centerLane = laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );
		// const rightLane1 = laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
		// const rightLane2 = laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.shoulder, true, true );
		// const rightLane3 = laneSection.addLane( TvLaneSide.RIGHT, -3, TvLaneType.sidewalk, true, true );

		// leftLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
		// centerLane.addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
		// rightLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

		// laneSection.getLaneVector().forEach( lane => {

		//     if ( lane.side !== TvLaneSide.CENTER ) {

		//         if ( lane.type == TvLaneType.driving ) lane.addWidthRecord( 0, 3.6, 0, 0, 0 );

		//         else if ( lane.type == TvLaneType.sidewalk ) lane.addWidthRecord( 0, 2, 0, 0, 0 );

		//         else lane.addWidthRecord( 0, 0.5, 0, 0, 0 );

		//     }

		// } );

		return road;
	}

	addConnectingRoad ( side: TvLaneSide, width: number, junctionId: number ): TvRoad {

		const road = this.addRoad( `${ this.roads.size + 1 }`, 0, this.roads.size + 1, junctionId );


		const laneSection = road.addGetLaneSection( 0 );

		if ( side === TvLaneSide.LEFT ) {
			laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
		}

		if ( side === TvLaneSide.RIGHT ) {
			laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
		}

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );

		laneSection.getLaneVector().forEach( lane => {

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

	public addNewJunction ( junctionName?: string ): TvJunction {

		const id = this.junctions.size + 1;

		const name = junctionName || `${ id }`;


		return this.junctions.get( id );
	}

	public addJunction ( name, id ): number {

		const index = this.getJunctionCount();

		this._junctions.set( id, new TvJunction( name, id ) );


		return index;
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

			console.error( `${ roadId } road-id not found` );
			// throw new Error( 'RoadID not found.' );

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

		this.propPolygons.forEach( polygon => {

			this.gameObject.remove( polygon.spline.mesh );

			polygon.props.forEach( prop => SceneService.remove( prop ) );

		} );

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

			return this.getRoadById( connection.connectingRoad );

		} else {

			console.error( 'unknown successor type' );

		}

	}
}
