/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMap } from '../models/tv-map.model';
import { RoadBuilder } from './road.builder';
import { GameObject } from 'app/objects/game-object';
import { Vector2 } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class TvMapBuilder {

	constructor (
		private roadBuilder: RoadBuilder,
	) {
	}

	build ( map: TvMap ) {

		// map.offset = this.calculateOffsets( map );
		//
		// this.adjustMapRoadGeometries( map, map.offset );

		const parent = new GameObject( 'Map' );

		const roads = map.getRoads();

		for ( const road of roads ) {

			const object3D = this.roadBuilder.buildRoad( road, parent );

			if ( !object3D ) continue;

			road.gameObject = object3D;

			parent.add( object3D );

		}

		return parent;
	}

	calculateOffsets ( map: TvMap ): Vector2 {

		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;

		map.roads.forEach( road => {

			road.geometries.forEach( geometry => {

				if ( geometry.x < minX ) minX = geometry.x;

				if ( geometry.y < minY ) minY = geometry.y;

			} );

		} );

		return new Vector2( minX, minY );
	}

	adjustMapRoadGeometries ( map: TvMap, offset: Vector2 ): void {

		map.roads.forEach( road => {

			road.geometries.forEach( geometry => {

				geometry.x = geometry.x - offset.x;
				geometry.y = geometry.y - offset.y;

			} );

		} )
	}

}

