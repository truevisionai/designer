/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { GameObject } from 'app/objects/game-object';
import { PropInstance } from 'app/map/prop-point/prop-instance.object';
import { TvConsole } from 'app/core/utils/console';
import { PropCurve } from '../prop-curve/prop-curve.model';
import { PropPolygon } from '../prop-polygon/prop-polygon.model';
import { TvSignalController } from '../signal-controller/tv-signal-controller';
import { TvJunction } from './junctions/tv-junction';
import { TvMapHeader } from './tv-map-header';
import { TvRoad } from './tv-road.model';
import { Surface } from '../surface/surface.model';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Object3D } from 'three';
import { Object3DMap } from 'app/core/models/object3d-map';
import { IDService } from 'app/factories/id.service';

export class TvMap {

	public props: PropInstance[] = [];

	public propCurves: PropCurve[] = [];

	public propPolygons: PropPolygon[] = [];

	public surfaces: Surface[] = [];

	public gameObject: GameObject = new GameObject( 'OpenDrive' );

	public surfaceGroup: Object3DMap<Surface, Object3D>;

	public propsGroup: Object3DMap<PropInstance, Object3D>;

	public propCurvesGroup: Object3DMap<PropCurve, Object3D>;

	public propPolygonsGroup: Object3DMap<PropPolygon, Object3D>;

	public header: TvMapHeader;

	public controllers: Map<number, TvSignalController> = new Map<number, TvSignalController>();

	public controllerIds = new IDService();

	public roads: Map<number, TvRoad> = new Map<number, TvRoad>();

	public junctions: Map<number, TvJunction> = new Map<number, TvJunction>();

	private splines: AbstractSpline[] = [];

	constructor () {

		this.surfaceGroup = new Object3DMap( this.gameObject );

		this.propsGroup = new Object3DMap( this.gameObject );

		this.propCurvesGroup = new Object3DMap( this.gameObject );

		this.propPolygonsGroup = new Object3DMap( this.gameObject );

		this.header = new TvMapHeader();

	}

	getRoads (): TvRoad[] {
		return Array.from( this.roads.values() );
	}

	getControllers () {
		return Array.from( this.controllers.values() );
	}

	public getHeader (): TvMapHeader {
		return this.header;
	}

	addSpline ( spline: AbstractSpline ): void {
		if ( this.splines.find( s => s.uuid == spline.uuid ) ) return;
		this.splines.push( spline );
	}

	removeSpline ( spline: AbstractSpline ): void {
		if ( !this.splines.find( s => s.uuid == spline.uuid ) ) return;
		this.splines.splice( this.splines.indexOf( spline ), 1 );
	}

	getSplines (): AbstractSpline[] {
		return this.splines;
	}

	getSplineCount (): number {
		return this.splines.length;
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

	addRoad ( road: TvRoad ) {

		this.roads.set( road.id, road );

	}

	getSurfaces () {

		return this.surfaces;

	}

	public removeRoad ( road: TvRoad ) {

		this.roads.delete( road.id );

	}

	getRoadById ( roadId: number ): TvRoad {

		if ( this.roads.has( roadId ) ) {

			return this.roads.get( roadId );

		} else {

			TvConsole.error( `${ roadId } road-id not found` );

			console.error( `${ roadId } road-id not found` );

		}

	}

	public getRoadCount (): number {

		return this.roads.size;

	}

	public getJunctionById ( id: number ): TvJunction {

		return this.junctions.get( id );

	}

	public getJunctionCount (): number {

		return this.junctions.size;

	}

	/**
	 * Clears the OpenDrive structure, could be used to start a new document
	 */
	public clear () {

		this.roads.clear();

		this.junctions.clear();

		this.props.splice( 0, this.props.length );

		this.propCurves.splice( 0, this.propCurves.length );

		this.propPolygons.splice( 0, this.propPolygons.length );

		this.surfaces.splice( 0, this.surfaces.length );

		this.splines.splice( 0, this.splines.length );
	}

	addJunctionInstance ( junction: TvJunction ) {

		this.junctions.set( junction.id, junction );

	}

	addController ( controller: TvSignalController ) {

		this.controllers.set( controller.id, controller );

	}

	destroy () {

		this.clear();

	}

	getJunctions () {

		return Array.from( this.junctions.values() );

	}

	removeJunction ( junction: TvJunction ) {

		this.junctions.delete( junction.id );

	}

	removeSurface ( surface: Surface ) {

		this.surfaces.splice( this.surfaces.indexOf( surface ), 1 );

	}

	addSurface ( surface: Surface ) {

		this.surfaces.push( surface );

	}

}
