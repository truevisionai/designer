import { Injectable } from '@angular/core';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-instance';
import { Material, Mesh } from 'three';

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

	setOpacityLevel ( opacity: number ) {

		this.resetMapOpacity();

		this.opactiyLevel = opacity;

		for ( let i = 0; i < this.roads.length; i++ ) {

			const road = this.roads[ i ];

			this.setRoadOpacity( road, opacity );

		}

	}

	setRoadOpacity ( road: TvRoad, opacity: number ) {

		for ( let j = 0; j < road.laneSections.length; j++ ) {

			const laneSection = road.laneSections[ j ];

			for ( const lane of laneSection.getLaneArray() ) {

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

					clone.transparent = opacity < 1.0;
					clone.opacity = opacity;
					clone.needsUpdate = true;

					mesh.material = clone;

				} else {

					const material = this.opacityObjects.get( lane.gameObject );

					const clone = material.clone();

					clone.transparent = opacity < 1.0;
					clone.opacity = opacity;
					clone.needsUpdate = true;

					mesh.material = clone;

				}

			}

		}
	}

	getOpacityLevel () {

		return this.opactiyLevel;

	}

	resetMapOpacity () {

		this.opacityObjects.forEach( ( originalMaterial, mesh ) => {

			mesh.material = originalMaterial;

		} );

		this.opacityObjects.clear();

	}

	reset () {

		this.map.clear();

	}

}
