/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseCommand } from './base-command';
import { NodeFactoryService } from '../factories/node-factory.service';
import { SceneService } from '../services/scene.service';
import { SetInspectorCommand } from './set-inspector-command';
import { LaneOffsetNode } from 'app/modules/three-js/objects/control-point';

export class AddLaneOffsetCommand extends BaseCommand {

    private command: SetInspectorCommand;

    constructor ( private node: LaneOffsetNode ) {

        super();

    }

    execute (): void {

        this.node.road.addLaneOffsetInstance( this.node.laneOffset );

        SceneService.add( this.node );

        // ( new SetInspectorCommand( LaneOffsetInspector, new LaneOffsetInspectorData( this.node, this.node.road ) ) ).execute();
    }

    undo (): void {

        this.node.road.removeLaneOffset( this.node.laneOffset );

        SceneService.remove( this.node );
    }

    redo (): void {

        this.execute();

    }

}