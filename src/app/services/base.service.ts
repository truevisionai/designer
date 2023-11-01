import { Injectable } from '@angular/core';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';

@Injectable( {
	providedIn: 'root'
} )
export abstract class BaseService {

	get map () {
		return TvMapInstance.map;
	}

	get scenario () {
		return ScenarioInstance.scenario;
	}

	rebuildRoad ( road: TvRoad ) {
		TvMapBuilder.rebuildRoad( road );
	}

}
