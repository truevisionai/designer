/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { NodeFactoryService } from '../factories/node-factory.service';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';

export class UpdateWidthNodeValueCommand extends BaseCommand {


    constructor (
        private node: LaneWidthNode,
        private newWidth: number,
        private oldWidth?: number,
        private laneHelper?: OdLaneReferenceLineBuilder
    ) {

        super();

        if ( !this.oldWidth ) {

            this.oldWidth = this.node.laneWidth.a;

        }

    }

    execute (): void {

        this.node.laneWidth.a = this.newWidth;

        this.node.updateLaneWidthValues();

        NodeFactoryService.updateLaneWidthNodeLine( this.node );

        this.rebuild( this.node.road );

    }

    undo (): void {

        this.node.laneWidth.a = this.oldWidth;

        this.node.updateLaneWidthValues();

        NodeFactoryService.updateLaneWidthNodeLine( this.node );

        this.rebuild( this.node.road );

    }

    redo (): void {

        this.execute();

    }

    rebuild ( road: TvRoad ): void {

        SceneService.removeWithChildren( road.gameObject, true );

        TvMapBuilder.buildRoad( this.map.gameObject, road );

        this.laneHelper.drawRoad( road, LineType.DASHED, true );

    }

}
