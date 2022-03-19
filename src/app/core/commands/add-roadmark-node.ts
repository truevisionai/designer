/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { SceneService } from '../services/scene.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { OdRoadMarkBuilder } from 'app/modules/tv-map/builders/od-road-mark-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvLaneRoadMark } from 'app/modules/tv-map/models/tv-lane-road-mark';

export class AddRoadmarkNodeCommand extends BaseCommand {

    private road: TvRoad;

    constructor ( private lane: TvLane, private roadMark: TvLaneRoadMark, private roadMarkbuilder: OdRoadMarkBuilder ) {

        super();

        this.road = this.openDrive.getRoadById( this.lane.roadId );

    }

    execute (): void {

        this.lane.addRoadMarkInstance( this.roadMark );

        SceneService.add( this.roadMark.node );

        this.roadMarkbuilder.buildRoad( this.road );

    }

    undo (): void {

        const index = this.lane.roadMark.findIndex( roadmark => roadmark.uuid === this.roadMark.uuid );

        this.lane.roadMark.splice( index, 1 );

        SceneService.remove( this.roadMark.node );

        this.roadMarkbuilder.buildRoad( this.road );
    }

    redo (): void {

        this.execute();

    }

}
