import { Injectable } from '@angular/core';
import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-instance';

@Injectable( {
	providedIn: 'root'
} )
export abstract class BaseService {

	protected get map () {
		return TvMapInstance.map;
	}

	protected get scenario () {
		return ScenarioInstance.scenario;
	}

	protected rebuildRoad ( road: TvRoad ) {
		TvMapBuilder.rebuildRoad( road );
	}

}
