/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';
import { LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { NodeFactoryService } from '../factories/node-factory.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { SceneService } from '../services/scene.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';

export class UpdateWidthNodePositionCommand extends BaseCommand {

    constructor (
        private node: LaneWidthNode,
        private newPosition: Vector3,
        private oldPosition: Vector3,
        private laneHelper: OdLaneReferenceLineBuilder
    ) {

        super();

    }

    execute (): void {

        NodeFactoryService.updateLaneWidthNode( this.node, this.newPosition );

        this.node.updateLaneWidthValues();

        this.rebuild( this.map.getRoadById( this.node.roadId ) );
    }

    undo (): void {

        NodeFactoryService.updateLaneWidthNode( this.node, this.oldPosition );

        this.node.updateLaneWidthValues();

        this.rebuild( this.map.getRoadById( this.node.roadId ) );

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
