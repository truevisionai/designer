/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvLaneSection } from '../../modules/tv-map/models/tv-lane-section';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { BaseCommand } from './base-command';

export class RemoveLaneCommand extends BaseCommand {

    constructor ( private laneSection: TvLaneSection, private lane: TvLane ) {

        super();

    }

    execute (): void {

        this.laneSection.removeLaneById( this.lane.id );

        TvMapInstance.mapChanged.emit( this.map );

    }

    undo (): void {

        this.laneSection.addLaneInstance( this.lane, true );

        TvMapInstance.mapChanged.emit( this.map );

    }

    redo (): void {

        this.execute();

    }

}
