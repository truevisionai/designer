/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { ICommand, ICommandCallback } from './i-command';
import { SceneService } from '../services/scene.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';


export abstract class BaseCommand implements ICommand {

	callbacks?: ICommandCallback;

	get map () {
		return TvMapInstance.map;
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
