import { Injectable } from '@angular/core';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

@Injectable( {
	providedIn: 'root'
} )
export abstract class BaseService {

	protected rebuildRoad ( road: TvRoad ) {
		TvMapBuilder.rebuildRoad( road );
	}

}
