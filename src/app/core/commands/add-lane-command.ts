/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { TvLaneSection } from '../../modules/tv-map/models/tv-lane-section';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';

export class AddLaneCommand extends BaseCommand {

    constructor ( private laneSection: TvLaneSection, private lane: TvLane ) {
        super();
    }

    execute (): void {

        this.laneSection.addLaneInstance( this.lane, true );

        TvMapInstance.mapChanged.emit( this.map );
    }

    undo (): void {

        this.laneSection.removeLaneById( this.lane.id );

        TvMapInstance.mapChanged.emit( this.map );

    }

    redo (): void {

        this.execute();

    }

}