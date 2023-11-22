import { Injectable } from '@angular/core';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';

/**
 * Base service
 *
 * @deprecated usage not recommended
 */
@Injectable( {
	providedIn: 'root'
} )
export abstract class BaseService {

	rebuildRoad ( road: TvRoad ) {
		TvMapBuilder.rebuildRoad( road );
	}

}
