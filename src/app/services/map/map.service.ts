/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvMap } from 'app/map/models/tv-map.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvMapInstance } from 'app/map/services/tv-map-instance';
import { Material, Mesh } from "three";
import { PropPolygon } from "../../map/prop-polygon/prop-polygon.model";
import { ModelNotFoundException } from 'app/exceptions/exceptions';
import { Log } from 'app/core/utils/log';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';

@Injectable( {
	providedIn: 'root'
} )
export class MapService {

	private opactiyLevel = 1;

	private opacityObjects = new Map<Mesh, Material>();

	constructor () {
		this.map = new TvMap();
	}

	get map () {
		return TvMapInstance.map;
	}

	set map ( value: TvMap ) {
		TvMapInstance.map = value;
	}

	setMap ( map: TvMap ): void {
		this.map = map;
	}

	get roads (): TvRoad[] {
		return this.map.getRoads();
	}

	get junctions (): TvJunction[] {
		return this.map.getJunctions();
	}

	get junctionRoads (): TvRoad[] {
		return this.roads.filter( road => road.isJunction );
	}

	get nonJunctionRoads (): TvRoad[] {
		return this.roads.filter( road => !road.isJunction );
	}

	get splines () {
		return this.map.getSplines();
	}

	get nonJunctionSplines () {
		return this.nonJunctionRoads.map( road => road.spline )
			.filter( ( spline, index, self ) => self.indexOf( spline ) === index );
	}

	get highestestRoadId (): number {
		return this.roads.reduce( ( highest: TvRoad, road: TvRoad ) => {
			return road.id > highest.id ? road : highest;
		} )?.id;
	}

	getRoad ( id: number ): TvRoad | undefined {

		return this.findRoad( id );

	}

	getNonJunctionRoadCount (): number {

		return this.nonJunctionRoads.length;

	}

	hasRoad ( road: TvRoad | number ): any {

		return this.map.hasRoad( road );

	}

	addRoad ( road: TvRoad ): void {

		this.map.addRoad( road );

	}

	removeRoad ( road: TvRoad ): void {

		this.map.removeRoad( road );

	}

	removeSpline ( spline: AbstractSpline ): void {

		this.map.removeSpline( spline );

	}

	findRoad ( id: number ): any {

		// return this.map.getRoadById( id );

		try {

			return this.map.getRoad( id );

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				Log.error( "Road not found", id );

			} else {

				Log.error( error );

			}

		}

	}

	addSpline ( spline: AbstractSpline ): void {

		this.map.addSpline( spline );

	}

	hasSpline ( spline: AbstractSpline ): boolean {

		return this.map.getSplines().find( s => s.uuid === spline.uuid ) !== undefined;

	}

	findSplineById ( id: number ): any {

		const spline = this.map.getSplines().find( s => s.id === id );

		if ( !spline ) {
			throw new Error( `Spline with id ${ id } not found` );
		}

		return spline;

	}

	hasJunction ( junction: TvJunction | number ): any {

		return this.map.hasJunction( junction );

	}

	findJunction ( id: number ): any {

		// return this.map.getJunctionById( id );

		try {

			return this.map.getJunction( id );

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				Log.error( "Junction not found", id );

			} else {

				Log.error( error );

			}

		}

	}

	removeJunction ( junction: TvJunction ): void {

		// this.map.removeJunction( junction );

		try {

			this.map.removeJunction( junction );

		} catch ( error ) {

			if ( error instanceof ModelNotFoundException ) {

				Log.error( "Junction not found", junction );

			} else {

				Log.error( error );

			}

		}

	}

	setOpacityLevel ( opacity: number ): void {

		this.resetMapOpacity();

		this.opactiyLevel = opacity;

		for ( let i = 0; i < this.roads.length; i++ ) {

			const road = this.roads[ i ];

			this.setRoadOpacity( road, opacity );

		}

	}

	setRoadOpacity ( road: TvRoad, opacity?: number ): void {

		const opacityValue = opacity || this.getOpacityLevel();

		for ( let j = 0; j < road.laneSections.length; j++ ) {

			const laneSection = road.laneSections[ j ];

			for ( const lane of laneSection.getLanes() ) {

				if ( !lane.gameObject ) continue;

				if ( !( lane.gameObject instanceof Mesh ) ) continue;

				const mesh = lane.gameObject

				if ( !this.opacityObjects.has( lane.gameObject ) ) {

					let material: Material;

					if ( mesh.material instanceof Material ) {

						material = mesh.material;

					} else if ( mesh.material instanceof Array ) {

						material = mesh.material[ 0 ];

					}

					this.opacityObjects.set( mesh, material );

					const clone = material.clone();

					clone.transparent = opacityValue < 1.0;
					clone.opacity = opacityValue;
					clone.needsUpdate = true;

					mesh.material = clone;

				} else {

					const material = this.opacityObjects.get( lane.gameObject );

					const clone = material.clone();

					clone.transparent = opacityValue < 1.0;
					clone.opacity = opacityValue;
					clone.needsUpdate = true;

					mesh.material = clone;

				}

			}

		}
	}

	getOpacityLevel (): number {

		return this.opactiyLevel;

	}

	resetMapOpacity (): void {

		this.opacityObjects.forEach( ( originalMaterial, mesh ) => {

			mesh.material = originalMaterial;

		} );

		this.opacityObjects.clear();

	}

	reset (): void {

		this.map.clear();

	}

	removePropPolygon ( object: PropPolygon ): void {

		this.map.propPolygons.splice( this.map.propPolygons.indexOf( object ), 1 );

	}

	addPropPolygon ( object: PropPolygon ): void {

		if ( this.map.propPolygons.includes( object ) ) return;

		this.map.propPolygons.push( object );

	}

	getLaneMeshes (): Mesh[] {

		const meshes: Mesh[] = [];

		for ( const road of this.roads ) {

			for ( const laneSection of road.laneSections ) {

				for ( const lane of laneSection.getLanes() ) {

					if ( lane.gameObject instanceof Mesh ) {

						meshes.push( lane.gameObject );

					}

				}

			}

		}

		return meshes;

	}

	getJunctionCount (): number {

		return this.junctions.length;

	}

	getRoadCount (): number {

		return this.roads.length;

	}

	getRoads (): TvRoad[] { return this.map.getRoads(); }

	getSplineCount (): any {

		return this.splines.length;

	}

	getSplines (): AbstractSpline[] {

		return this.splines;

	}
}
