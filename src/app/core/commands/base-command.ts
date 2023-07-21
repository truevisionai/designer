/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ScenarioInstance } from 'app/modules/scenario/services/scenario-instance';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { SceneService } from '../services/scene.service';
import { BaseTool } from '../tools/base-tool';
import { ToolManager } from '../tools/tool-manager';
import { ICommand, ICommandCallback } from './i-command';


export abstract class BaseCommand implements ICommand {

	callbacks?: ICommandCallback;

	get map () {
		return TvMapInstance.map;
	}

	get scenario () {
		return ScenarioInstance.scenario;
	}

	abstract execute (): void;

	abstract undo (): void;

	abstract redo (): void;

	buildRoad ( road: TvRoad ): void {

		if ( !road ) return;

		SceneService.removeWithChildren( road.gameObject, true );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

	}

	getTool<T extends BaseTool> (): T {
		return ToolManager.getTool<T>();
	}

}
