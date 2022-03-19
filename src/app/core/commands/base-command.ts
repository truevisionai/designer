/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ICommand, ICommandCallback } from './i-command';
import { TvMapSourceFile } from '../../modules/tv-map/services/tv-map-source-file';


export abstract class BaseCommand implements ICommand {

    callbacks?: ICommandCallback;

    abstract execute (): void;

    abstract undo (): void;

    abstract redo (): void;

    get openDrive () {
        return TvMapSourceFile.openDrive;
    }

}
