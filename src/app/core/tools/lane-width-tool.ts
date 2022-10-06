/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { AnyControlPoint, LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { LaneWidthInspector } from 'app/views/inspectors/lane-width-inspector/lane-width-inspector.component';
import { Subscription } from 'rxjs';
import { Vector3 } from 'three';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { AddWidthNodeCommand } from '../commands/add-width-node-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { UpdateWidthNodePositionCommand } from '../commands/update-width-node-position-command';
import { UpdateWidthNodeValueCommand } from '../commands/update-width-node-value-command';
import { NodeFactoryService } from '../factories/node-factory.service';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { SceneService } from '../services/scene.service';
import { BaseTool } from './base-tool';

export class LaneWidthTool extends BaseTool {

    public name: string = 'LaneWidth';

    private widthChangeSub: Subscription;

    private laneWidthChanged: boolean = false;
    private pointerDown: boolean = false;
    private pointerDownAt: Vector3;

    private lane: TvLane;
    private controlPoint: AnyControlPoint;
    private widthNode: LaneWidthNode;

    private laneHelper: OdLaneReferenceLineBuilder;


    constructor () {

        super();

    }

    // tslint:disable-next-line: member-ordering
    static hideNodes ( road: TvRoad ): void {

        road.laneSections.forEach( laneSection => {

            laneSection.lanes.forEach( lane => {

                lane.getLaneWidthVector().forEach( laneWidth => {

                    if ( laneWidth.mesh ) laneWidth.mesh.visible = false;

                } );

            } );

        } );

    }

    // tslint:disable-next-line: member-ordering
    static showNodes ( road: TvRoad ) {

        road.laneSections.forEach( laneSection => {

            laneSection.lanes.forEach( lane => {

                lane.getLaneWidthVector().forEach( laneWidth => {

                    if ( laneWidth.mesh ) {

                        laneWidth.mesh.visible = true;

                    } else {

                        laneWidth.mesh = NodeFactoryService.createLaneWidthNode( road, lane, laneWidth.s, laneWidth );

                        SceneService.add( laneWidth.mesh );

                    }

                } );

            } );

        } );
    }

    init () {


    }

    enable () {

        super.enable();

        this.laneHelper = new OdLaneReferenceLineBuilder( null, LineType.DASHED );

        // this.widthChangeSub = LaneWidthInspector.widthChanged.subscribe( ( data: LaneWidthInspectorData ) => {

        //     data.node.road.getLaneSectionAt( data.node.s ).updateLaneWidthValues( data.node.lane );

        //     NodeFactoryService.updateLaneWidthNodeLine( data.node );

        //     this.rebuild( data.node.road );

        // } );

        this.widthChangeSub = LaneWidthInspector.widthChanged.subscribe( width => {

            CommandHistory.execute( new UpdateWidthNodeValueCommand( this.widthNode, width, null, this.laneHelper ) );

        } );


    }

    disable () {

        super.disable();

        if ( this.laneHelper ) this.laneHelper.clear();

        if ( this.widthChangeSub ) this.widthChangeSub.unsubscribe();

        this.map.roads.forEach( road => LaneWidthTool.hideNodes( road ) );
    }

    public onPointerDown ( e: PointerEventData ) {

        if ( e.button === MouseButton.RIGHT || e.button === MouseButton.MIDDLE ) return;

        this.pointerDown = true;

        this.pointerDownAt = e.point;

        const shiftKeyDown = KeyboardInput.isShiftKeyDown;

        let hasInteracted = false;

        // check for control point interactions first
        if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkNodePointInteraction( e );

        // check for line segment interactions
        // if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkNodeLineInteraction( e );

        // if ( !hasInteracted ) hasInteracted = this.checkReferenceLineInteraction( e );

        // check for lane game object interactions
        if ( !hasInteracted ) hasInteracted = this.checkLaneObjectInteraction( e );

        if ( !hasInteracted ) {

            // // no interaction with line, lane, points etc
            // if ( this.lane ) {

            //     LaneWidthTool.hideNodes( this.openDrive.getRoadById( this.lane.roadId ) );

            //     this.laneHelper.clear();

            //     this.lane = null;

            // }

        }

    }

    public onPointerClicked ( e: PointerEventData ) {

        if ( e.button === MouseButton.LEFT && KeyboardInput.isShiftKeyDown && e.point != null ) {

            this.addNode( e.point );

        }
    }

    public onPointerUp ( e ) {

        if ( this.laneWidthChanged && this.widthNode ) {

            const newPosition = this.widthNode.point.position.clone();

            const oldPosition = this.pointerDownAt.clone();

            CommandHistory.execute( new UpdateWidthNodePositionCommand( this.widthNode, newPosition, oldPosition, this.laneHelper ) );

        }

        this.pointerDown = false;

        this.pointerDownAt = null;

        this.laneWidthChanged = false;
    }

    public onPointerMoved ( e: PointerEventData ) {

        if ( this.pointerDown && this.widthNode ) {

            this.laneWidthChanged = true;

            NodeFactoryService.updateLaneWidthNode( this.widthNode, e.point );

            this.widthNode.updateLaneWidthValues();

            // this.updateLaneWidth( this.pointerObject.parent as LaneWidthNode );

            // if ( this.lane ) this.laneHelper.redraw( LineType.DASHED );

        }

        // else if ( this.pointerDown && this.pointerObject && this.pointerObject[ 'tag' ] == LaneWidthNode.lineTag ) {

        //     this.laneWidthChanged = true;

        //     NodeFactoryService.updateLaneWidthNode( this.pointerObject.parent as LaneWidthNode, e.point );

        //     this.updateLaneWidth( this.pointerObject.parent as LaneWidthNode );

        //     if ( this.lane ) this.laneHelper.redraw( LineType.DASHED );

        // }
    }

    // private checkReferenceLineInteraction ( e: PointerEventData ) {

    //     let hasInteracted = false;

    //     this.checkIntersection( this.laneHelper.tag, e.intersections, ( obj ) => {

    //         hasInteracted = true;

    //         this.laneHelper.onLineSelected( obj as Line );

    //     } );

    //     return hasInteracted;
    // }

    private checkNodePointInteraction ( e: PointerEventData ): boolean {

        // first chceck for control point interactions
        // doing in 2 loop to prioritise control points
        const controlPoint = PickingHelper.checkControlPointInteraction( e, LaneWidthNode.pointTag );

        if ( controlPoint ) {

            const laneWidthNode = controlPoint.parent as LaneWidthNode;

            CommandHistory.executeMany(
                new SetValueCommand( this, 'controlPoint', controlPoint ),

                new SetValueCommand( this, 'widthNode', laneWidthNode ),

                new SetInspectorCommand( LaneWidthInspector, { node: laneWidthNode } ),
            );

        } else if ( this.controlPoint ) {

            CommandHistory.executeMany(
                new SetValueCommand( this, 'controlPoint', null ),

                new SetInspectorCommand( LaneWidthInspector, { node: null, lane: this.lane } ),
            );

        }

        return controlPoint != null;
    }

    private checkLaneObjectInteraction ( e: PointerEventData ) {

        let hasInteracted = false;

        for ( let i = 0; i < e.intersections.length; i++ ) {

            const intersection = e.intersections[ i ];

            // tslint:disable-next-line: no-string-literal
            if ( intersection.object && intersection.object[ 'tag' ] === ObjectTypes.LANE ) {

                hasInteracted = true;

                if ( intersection.object.userData.lane ) {

                    const newLane = intersection.object.userData.lane as TvLane;


                    // check if old or a new lane is selected
                    if ( !this.lane || this.lane.id !== newLane.id || this.lane.roadId !== newLane.roadId ) {

                        CommandHistory.executeMany(
                            new SetValueCommand( this, 'lane', newLane ),

                            new SetInspectorCommand( LaneWidthInspector, { lane: newLane } ),
                        );

                    }
                }

                break;
            }
        }

        if ( !hasInteracted && !this.controlPoint ) {

            CommandHistory.executeMany(
                new SetValueCommand( this, 'lane', null ),

                new SetInspectorCommand( null, null ),
            );

            this.laneHelper.clear();
        }

        return hasInteracted;
    }

    private addNode ( position: Vector3 ): void {

        if ( !this.lane ) return;

        const road = this.map.getRoadById( this.lane.roadId );

        const laneWidthNode = NodeFactoryService.createLaneWidthNodeByPosition( road, this.lane, position );

        CommandHistory.executeMany(
            new SetValueCommand( this, 'widthNode', laneWidthNode ),

            new AddWidthNodeCommand( laneWidthNode, this.laneHelper ),

            new SetInspectorCommand( LaneWidthInspector, { node: laneWidthNode } ),
        );
    }

}
