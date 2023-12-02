import { Injectable } from '@angular/core';
import { GameObject } from 'app/core/game-object';
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

	rebuildRoad ( road: TvRoad ): GameObject {

		return TvMapBuilder.rebuildRoad( road );

	}

}
