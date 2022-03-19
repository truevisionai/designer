/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { OdBaseCommand } from './od-base-command';
import { TvRoadSignal } from '../../modules/tv-map/models/tv-road-signal.model';
import { TvMapBuilder } from '../../modules/tv-map/builders/od-builder.service';
import { ObjectSelection } from 'app/core/selection';
import { AppInspector } from '../inspector';

export class RemoveSignalCommand extends OdBaseCommand {

    constructor ( public signal: TvRoadSignal ) {
        super();
    }

    execute (): void {

        this.signal.gameObject.parent.remove( this.signal.gameObject );

        this.getRoad( this.signal.roadId ).removeSignal( this.signal );

        ObjectSelection.removeActive();

        AppInspector.clear();
    }

    undo (): void {

        TvMapBuilder.makeRoadSignal( this.getRoad( this.signal.roadId ), this.signal );

        this.getRoad( this.signal.roadId ).addSignal( this.signal );

        ObjectSelection.ActiveGameObject = this.signal.gameObject;

    }

    redo (): void {

        this.execute();

    }
}
