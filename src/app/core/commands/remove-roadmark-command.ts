/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { TvLaneRoadMark } from '../../modules/tv-map/models/tv-lane-road-mark';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { OdRoadMarkBuilder } from '../../modules/tv-map/builders/od-road-mark-builder';

export class RemoveRoadmarkCommand extends BaseCommand {

    private index: number;

    private roadMarkBuilder = new OdRoadMarkBuilder( null );

    constructor ( private roadmark: TvLaneRoadMark, private lane: TvLane ) {

        super();

    }

    execute (): void {

        this.lane.gameObject.remove( this.roadmark.gameObject );

        this.removeFromLane();

        this.rebuild();
    }

    undo (): void {

        this.lane.gameObject.add( this.roadmark.gameObject );

        this.lane.addRoadMarkInstance( this.roadmark );

        this.rebuild();
    }

    redo (): void {

        this.execute();

    }

    private rebuild () {

        this.openDrive.roads.forEach( road => {

            this.roadMarkBuilder.buildRoad( road );

        } );

    }

    private removeFromLane () {

        this.lane.getRoadMarks().forEach( ( ( value, i ) => {

            if ( value.sOffset === this.roadmark.sOffset ) {

                this.index = i;

            }

        } ) );

        this.lane.getRoadMarks().splice( this.index, 1 );

    }
}
