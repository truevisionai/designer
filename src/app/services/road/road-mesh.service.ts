import { Injectable } from '@angular/core';
import { TvLaneSide } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { BufferGeometry } from 'three';

@Injectable( {
	providedIn: 'root'
} )
export class RoadMeshService {

	constructor () { }

	getRoadGeometries ( roads: TvRoad[] ): BufferGeometry[] {

		const geometries: BufferGeometry[] = [];

		roads.forEach( road => {

			road.getLaneProfile().getLaneSections().forEach( laneSection => {

				laneSection.getLaneArray().forEach( lane => {

					if ( lane.side === TvLaneSide.CENTER ) return;

					geometries.push( lane.gameObject.geometry );

				} );

			} );

		} )

		return geometries;

	}



}
