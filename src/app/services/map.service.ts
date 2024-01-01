import { Injectable } from '@angular/core';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-instance';

@Injectable( {
	providedIn: 'root'
} )
export class MapService {

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

	get junctionRoads (): TvRoad[] {
		return this.roads.filter( road => road.isJunction );
	}

	get nonJunctionRoads (): TvRoad[] {
		return this.roads.filter( road => !road.isJunction );
	}

	get splines () {
		return this.map.getSplines();
	}

	reset () {

		this.map.clear();

	}

}
