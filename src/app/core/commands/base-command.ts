/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ICommand, ICommandCallback } from './i-command';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';


export abstract class BaseCommand implements ICommand {

    callbacks?: ICommandCallback;

    abstract execute (): void;

    abstract undo (): void;

    abstract redo (): void;

    get map () {
        return TvMapInstance.map;
    }

}
