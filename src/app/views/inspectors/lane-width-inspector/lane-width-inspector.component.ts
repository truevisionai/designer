/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { RemoveWidthNodeCommand } from 'app/core/commands/remove-width-node-command';
import { BaseInspector } from 'app/core/components/base-inspector.component';
import { IComponent } from 'app/core/game-object';
import { LaneWidthTool } from 'app/core/tools/lane-width-tool';
import { LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { LineType, OdLaneReferenceLineBuilder } from '../../../modules/tv-map/builders/od-lane-reference-line-builder';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { TvLaneWidth } from '../../../modules/tv-map/models/tv-lane-width';

export interface LaneWidthInspectorData {
    node: LaneWidthNode;
}

@Component( {
    selector: 'app-lane-width-inspector',
    templateUrl: './lane-width-inspector.component.html'
} )
export class LaneWidthInspector extends BaseInspector implements OnInit, IComponent, OnDestroy {

    public static widthChanged = new EventEmitter<number>();
    public static distanceChanged = new EventEmitter<number>();

    data: {
        node: LaneWidthNode,
        lane: TvLane,
    };

    private laneHelper = new OdLaneReferenceLineBuilder( null, LineType.DASHED );

    constructor () {

        super();

    }

    get node () {
        return this.data.node;
    }

    set node ( value ) {
        this.data.node = value;
    }

    get width (): TvLaneWidth {
        return this.data.node.laneWidth;
    }

    get roadId () {

        if ( this.data.lane ) return this.data.lane.roadId;

        if ( this.data.node ) return this.data.node.roadId;

        SnackBar.error( 'Road not found' );
    }

    get road () {

        return this.map.getRoadById( this.roadId );

    }

    ngOnInit () {

        if ( this.data.node ) {

            this.data.node.point.select();

        }

        if ( this.road ) {

            LaneWidthTool.showNodes( this.road );

            this.laneHelper.drawRoad( this.road, LineType.DASHED );

        }
    }

    ngOnDestroy () {

        if ( this.data.node ) {

            this.data.node.point.unselect();

        }

        if ( this.road ) {

            LaneWidthTool.hideNodes( this.road );

        }

        this.laneHelper.clear();
    }

    onWidthChanged ( $value: number ) {

        // this.width.a = $value;

        LaneWidthInspector.widthChanged.emit( $value );

    }

    onDistanceChanged ( $value: number ) {

        // this.node.s = this.width.s = $value;

        LaneWidthInspector.distanceChanged.emit( $value );

    }

    onDelete () {

        if ( this.node ) {

            CommandHistory.execute( new RemoveWidthNodeCommand( this.node ) );

        }

    }
}
