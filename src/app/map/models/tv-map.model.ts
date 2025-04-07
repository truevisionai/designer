/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/objects/game-object';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { PropCurve } from '../prop-curve/prop-curve.model';
import { PropPolygon } from '../prop-polygon/prop-polygon.model';
import { TvSignalController } from '../signal-controller/tv-signal-controller';
import { TvJunction } from './junctions/tv-junction';
import { TvMapHeader } from './tv-map-header';
import { TvRoad } from './tv-road.model';
import { Surface } from '../surface/surface.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Object3D, Vector2 } from "three";
import { Object3DMap } from 'app/core/models/object3d-map';
import { ManagedMap } from "../../core/models/managed-map";
import { DuplicateKeyException, ModelNotFoundException } from 'app/exceptions/exceptions';
import { ParkingGraph } from "../parking/parking-graph";

export class TvMap {

	private props: PropInstance[] = [];

	public propCurves: PropCurve[] = [];

	public propPolygons: PropPolygon[] = [];

	private surfaces: Surface[] = [];

	public gameObject: GameObject = new GameObject( 'OpenDrive' );

	public surfaceGroup: Object3DMap<Surface, Object3D>;

	public propsGroup: Object3DMap<PropInstance, Object3D>;

	public propCurvesGroup: Object3DMap<PropCurve, Object3D>;

	public propPolygonsGroup: Object3DMap<PropPolygon, Object3D>;

	public header: TvMapHeader;

	private controllers = new ManagedMap<TvSignalController>();

	private roads = new ManagedMap<TvRoad>();

	private junctions = new ManagedMap<TvJunction>();

	public offset = new Vector2();

	private splines: AbstractSpline[] = [];

	private parkingGraph: ParkingGraph;

	constructor () {

		this.surfaceGroup = new Object3DMap( this.gameObject );

		this.propsGroup = new Object3DMap( this.gameObject );

		this.propCurvesGroup = new Object3DMap( this.gameObject );

		this.propPolygonsGroup = new Object3DMap( this.gameObject );

		this.header = new TvMapHeader();

		this.parkingGraph = new ParkingGraph();

	}

	getRoads (): TvRoad[] {
		return Array.from( this.roads.values() );
	}

	getControllers (): TvSignalController[] {
		return Array.from( this.controllers.values() );
	}

	getControllerCount (): number {
		return this.controllers.size;
	}

	getNextControllerId (): number {
		return this.controllers.next();
	}

	addController ( controller: TvSignalController ): void {
		this.controllers.set( controller.id, controller );
	}

	removeController ( controller: number | TvSignalController ): void {
		if ( typeof controller === 'number' ) {
			this.controllers.delete( controller );
		} else {
			this.controllers.delete( controller.id );
		}
	}

	addSpline ( spline: AbstractSpline ): void {
		if ( this.splines.find( s => s.uuid == spline.uuid ) ) {
			throw new DuplicateKeyException( `Spline with uuid ${ spline.uuid } already exists` );
		}
		spline.setMap( this );
		this.splines.push( spline );
	}

	removeSpline ( spline: AbstractSpline ): void {
		if ( !this.splines.find( s => s.uuid == spline.uuid ) ) {
			throw new ModelNotFoundException( `Spline:${ spline.type } with uuid ${ spline.uuid } not found` );
		}
		this.splines.splice( this.splines.indexOf( spline ), 1 );
	}

	hasSpline ( spline: AbstractSpline ): AbstractSpline {
		return this.splines.find( s => s.uuid == spline.uuid );
	}

	getSplines (): AbstractSpline[] {
		return this.splines;
	}

	getSplineCount (): number {
		return this.splines.length;
	}

	findSplineBySegment ( segment: TvRoad | TvJunction ): AbstractSpline | undefined {
		return this.splines.find( spline => spline.hasSegment( segment ) );
	}

	/**
	 *
	 * @param name
	 * @param length
	 * @param id
	 * @param junction
	 * @returns
	 * @deprecated use factory
	 */
	public addNewRoad ( name: string, length: number, id: number, junction?: TvJunction ): TvRoad {

		const road = new TvRoad( name, length, id, junction );

		this.addRoad( road );

		return road;
	}

	generateRoadId ( useRemoved: boolean = true ): number {
		return this.roads.next( useRemoved );
	}

	/**
	 * Adds a road to the map
	 * @param road
	 */
	addRoad ( road: TvRoad ): void {

		if ( this.roads.has( road.id ) ) {
			throw new DuplicateKeyException( `Road with id ${ road.id } already exists` );
		}

		road.setMap( this );

		this.roads.set( road.id, road );
	}

	/**
	 * Inserts a road into the map and assigns a new id
	 * @param road
	 */
	insertRoad ( road: TvRoad ): void {

		road.setId( this.generateRoadId() );

		this.addRoad( road );

	}

	/**
	 *
	 * @param road
	 */
	updateRoadId ( road: TvRoad ): void {
		road.setId( this.generateRoadId() );
	}

	hasRoad ( road: TvRoad | number ): boolean {
		if ( typeof road === 'number' ) {
			return this.roads.has( road );
		}
		return this.roads.has( road.id );
	}

	getSurfaces (): Surface[] {

		return this.surfaces;

	}

	removeRoad ( road: TvRoad ): void {

		if ( !this.roads.has( road.id ) ) {
			throw new ModelNotFoundException( `Road with id ${ road.id } not found` );
		}

		this.roads.delete( road.id );

	}

	getRoad ( road: TvRoad | number ): TvRoad {

		const roadId = typeof road === 'number' ? road : road.id;

		if ( !this.roads.has( roadId ) ) {
			throw new ModelNotFoundException( `Road with id ${ roadId } not found` );
		}

		return this.roads.get( roadId );
	}

	getRoadCount (): number {

		return this.roads.size;

	}

	getJunction ( junction: TvJunction | number ): TvJunction {

		const junctionId = typeof junction === 'number' ? junction : junction.id;

		if ( !this.junctions.has( junctionId ) ) {
			throw new ModelNotFoundException( `Junction with id ${ junctionId } not found` );
		}

		return this.junctions.get( junctionId );

	}

	getNextJunctionId (): number {
		return this.junctions.next();
	}

	getJunctionCount (): number {

		return this.junctions.size;

	}

	addJunction ( junction: TvJunction ): void {

		if ( this.junctions.has( junction.id ) ) {
			throw new DuplicateKeyException( `Junction with id ${ junction.id } already exists` );
		}

		junction.setMap( this );

		this.junctions.set( junction.id, junction );

	}

	hasJunction ( junction: TvJunction | number ): boolean {
		if ( typeof junction === 'number' ) {
			return this.junctions.has( junction );
		}
		return this.junctions.has( junction.id );
	}

	getJunctions (): TvJunction[] {

		return Array.from( this.junctions.values() );

	}

	removeJunction ( junction: TvJunction ): void {

		if ( !this.junctions.has( junction.id ) ) {
			throw new ModelNotFoundException( `Junction with id ${ junction.id } not found` );
		}

		this.junctions.delete( junction.id );

	}

	removeSurface ( surface: Surface ): void {

		this.surfaces.splice( this.surfaces.indexOf( surface ), 1 );

	}

	addSurface ( surface: Surface ): void {

		this.surfaces.push( surface );

	}

	getProps (): PropInstance[] {
		return this.props;
	}

	addProp ( prop: PropInstance ): void {
		this.props.push( prop );
	}

	removeProp ( prop: PropInstance ): void {
		this.props.splice( this.props.indexOf( prop ), 1 );
	}

	destroy (): void {

		this.clear();

	}

	getParkingGraph (): ParkingGraph {
		return this.parkingGraph;
	}

	setParkingGraph ( parkingGraph: ParkingGraph ): void {
		this.parkingGraph = parkingGraph;
	}

	// getParkingCurves (): readonly ParkingCurve[] {
	// 	return this.parkingGraph.getCurves();
	// }

	// addParkingCurve ( parkingCurve: ParkingCurve ): void {
	// 	this.parkingCurves.push( parkingCurve );
	// }

	// removeParkingCurve ( parkingCurve: ParkingCurve ): void {
	// 	const index = this.parkingCurves.indexOf( parkingCurve );
	// 	if ( index === - 1 ) {
	// 		throw new ModelNotFoundException( `ParkingCurve with id ${ parkingCurve.id } not found` );
	// 	} else {
	// 		this.parkingCurves.splice( index, 1 );
	// 		console.log( 'ParkingCurve removed', parkingCurve );
	// 	}
	// }

	// hasParkingCurve ( parkingCurve: ParkingCurve ): boolean {
	// 	return this.parkingCurves.includes( parkingCurve );
	// }

	/**
	 * Clears the OpenDrive structure, could be used to start a new document
	 */
	clear (): void {

		this.roads.clear();

		this.junctions.clear();

		this.props.splice( 0, this.props.length );

		this.propCurves.splice( 0, this.propCurves.length );

		this.propPolygons.splice( 0, this.propPolygons.length );

		this.surfaces.splice( 0, this.surfaces.length );

		this.splines.splice( 0, this.splines.length );
	}
}
