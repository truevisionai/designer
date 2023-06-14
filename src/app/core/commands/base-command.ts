/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvScenarioInstance } from '../../modules/scenario/services/tv-scenario-instance';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { SceneService } from '../services/scene.service';
import { ICommand, ICommandCallback } from './i-command';


export abstract class BaseCommand implements ICommand {

	callbacks?: ICommandCallback;

	get map () {
		return TvMapInstance.map;
	}

	get scenario () {
		return TvScenarioInstance.scenario;
	}

	abstract execute (): void;

	abstract undo (): void;

	abstract redo (): void;

	buildRoad ( road: TvRoad ): void {

		if ( !road ) return;

		SceneService.removeWithChildren( road.gameObject, true );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

	}


}
