/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { LaneOffsetNode } from 'app/modules/three-js/objects/control-point';
import { SceneService } from '../services/scene.service';
import { OdLaneReferenceLineBuilder, LineType } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';

export class UpdateLaneOffsetValueCommand extends BaseCommand {

    constructor (
        private node: LaneOffsetNode,
        private newOffset: number,
        private oldOffset?: number,
        private laneHelper?: OdLaneReferenceLineBuilder
    ) {

        super();

        if ( !this.oldOffset ) {

            this.oldOffset = this.node.laneOffset.a;

        }

    }

    execute (): void {

        this.node.laneOffset.a = this.newOffset;

        this.rebuild( this.node.road );


    }

    undo (): void {

        this.node.laneOffset.a = this.oldOffset;

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
