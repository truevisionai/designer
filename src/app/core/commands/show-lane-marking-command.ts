/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { NodeFactoryService } from '../factories/node-factory.service';
import { SceneService } from '../services/scene.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SnackBar } from 'app/services/snack-bar.service';

export class ShowLaneMarkingCommand extends BaseCommand {

    private road: TvRoad;

    private oldRoad: TvRoad;

    constructor ( private lane: TvLane, private oldLane: TvLane, private laneHelper: OdLaneReferenceLineBuilder ) {

        super();

        if ( lane ) {

            this.road = this.map.getRoadById( this.lane.roadId );

        }

        if ( oldLane ) {

            this.oldRoad = this.map.getRoadById( this.oldLane.roadId );

        }
    }

    execute (): void {

        if ( this.oldRoad ) {

            this.hideNodes( this.oldRoad );

        }

        if ( this.road ) {

            this.showNodes( this.road );

        }
    }

    undo (): void {

        if ( this.road ) {

            this.hideNodes( this.road );

        }

        if ( this.oldRoad ) {

            this.showNodes( this.oldRoad );

        }
    }

    redo (): void {

        this.execute();

    }

    private showNodes ( road: TvRoad ) {

        if ( road.isJunction ) SnackBar.error( "LaneMark Editing on junction roads is currently not supported" );

        if ( road.isJunction ) return;

        road.laneSections.forEach( laneSection => {

            laneSection.lanes.forEach( lane => {

                lane.getRoadMarks().forEach( roadmark => {

                    if ( roadmark.node ) {

                        roadmark.node.visible = true;

                    } else {

                        roadmark.node = NodeFactoryService.createRoadMarkNode( lane, roadmark );

                        SceneService.add( roadmark.node );

                    }

                } )

            } )

        } );

        this.laneHelper.drawRoad( road );
    }

    private hideNodes ( road: TvRoad ) {

        road.laneSections.forEach( laneSection => {

            laneSection.lanes.forEach( lane => {

                lane.getRoadMarks().forEach( roadmark => {

                    if ( roadmark.node ) roadmark.node.visible = false;

                } );

            } );

        } );

        this.laneHelper.clear();
    }
}