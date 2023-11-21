/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/commands/base-command';
import { TvRoad } from '../modules/tv-map/models/tv-road.model';
import { TvMapInstance } from '../modules/tv-map/services/tv-map-instance';

export abstract class OdBaseCommand extends BaseCommand {

	abstract execute (): void;

	abstract undo (): void;

	abstract redo (): void;

	protected getRoad ( roadId: number ): TvRoad {
		return TvMapInstance.map.getRoadById( roadId );
	}

}
