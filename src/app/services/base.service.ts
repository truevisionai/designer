/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { GameObject } from 'app/objects/game-object';
import { TvMapBuilder } from 'app/map/builders/tv-map-builder';
import { TvRoad } from 'app/map/models/tv-road.model';

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
