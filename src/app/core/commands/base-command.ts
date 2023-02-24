/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { ICommand, ICommandCallback } from './i-command';


export abstract class BaseCommand implements ICommand {

    callbacks?: ICommandCallback;

    get map () {
        return TvMapInstance.map;
    }

    abstract execute (): void;

    abstract undo (): void;

    abstract redo (): void;

}
