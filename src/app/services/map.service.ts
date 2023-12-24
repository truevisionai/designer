import { Injectable } from '@angular/core';
import { TvMap } from 'app/modules/tv-map/models/tv-map.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-instance';

@Injectable( {
	providedIn: 'root'
} )
export class MapService {

	constructor () {
	}

	get map () {
		return TvMapInstance.map;
	}

	set map ( value: TvMap ) {
		TvMapInstance.map = value;
	}

	reset () {

		this.map.getSplines().forEach( spline => {

			this.map.removeSpline( spline );

		} );

		this.map.roads.clear();

		this.map.junctions.clear();

	}

}
