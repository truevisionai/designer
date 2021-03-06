/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component } from '@angular/core';
import { IComponent } from '../../../core/game-object';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { TvLaneType } from '../../../modules/tv-map/models/tv-common';
import { MatSelectChange } from '@angular/material';
import { FrontSide, MeshBasicMaterial } from 'three';
import { OdTextures } from '../../../modules/tv-map/builders/od.textures';
import { COLOR } from '../../../shared/utils/colors.service';
import { BaseInspector } from '../../../core/components/base-inspector.component';
import { RemoveLaneCommand } from '../../../core/commands/remove-lane-command';
import { CommandHistory } from '../../../services/command-history';
import { SetLanePropertyCommand } from '../../../core/commands/set-lane-property-command';
import { ICommandCallback } from '../../../core/commands/i-command';

@Component( {
    selector: 'app-lane-type-inspector',
    templateUrl: './lane-inspector.component.html',
} )
export class LaneInspectorComponent extends BaseInspector implements IComponent, ICommandCallback {

    data: TvLane;

    get types () {
        return TvLaneType;
    }

    get lane (): TvLane {
        return this.data;
    }

    onChange ( $event: MatSelectChange ) {

        this.rebuild();

    }

    onDelete () {

        const road = this.map.getRoadById( this.lane.roadId );

        const laneSection = road.getLaneSectionById( this.lane.laneSectionId );

        CommandHistory.execute( new RemoveLaneCommand( laneSection, this.lane ) );

    }

    onTypeChanged ( $event: MatSelectChange ) {

        const cmd = new SetLanePropertyCommand( this.lane, 'type', $event.value );

        cmd.callbacks = this;

        CommandHistory.execute( cmd );

    }

    onExecute (): void {

        this.rebuild();

    }

    onUndo (): void {

        this.rebuild();

    }

    onRedo (): void {

        this.rebuild();

    }

    rebuild () {

        const material = new MeshBasicMaterial( {
            map: OdTextures.getLaneTexture( this.lane ),
            color: COLOR.WHITE,
            wireframe: false,
            side: FrontSide
        } );

        this.lane.gameObject.material = null;
        this.lane.gameObject.material = material;
    }
}
