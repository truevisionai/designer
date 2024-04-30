/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvMap } from '../models/tv-map.model';
import { RoadBuilder } from './road.builder';
import { GameObject } from 'app/objects/game-object';

@Injectable( {
	providedIn: 'root'
} )
export class TvMapBuilder {

	constructor (
		private roadBuilder: RoadBuilder,
	) {
	}

	build ( map: TvMap ) {

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

}

