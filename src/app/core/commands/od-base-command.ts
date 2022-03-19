/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from 'app/core/commands/base-command';
import { TvMapSourceFile } from '../../modules/tv-map/services/tv-map-source-file';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';

export abstract class OdBaseCommand extends BaseCommand {

    abstract execute (): void;

    abstract undo (): void;

    abstract redo (): void;

    protected getRoad ( roadId: number ): TvRoad {
        return TvMapSourceFile.openDrive.getRoadById( roadId );
    }

}
