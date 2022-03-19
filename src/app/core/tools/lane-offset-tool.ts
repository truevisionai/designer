/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { Object3D, Vector3 } from 'three';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { AnyControlPoint, LaneOffsetNode, LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { SceneService } from '../services/scene.service';
import { Subscription } from 'rxjs';
import { KeyboardInput } from '../input';
import { NodeFactoryService } from '../factories/node-factory.service';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { AppInspector } from '../inspector';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { PickingHelper } from '../services/picking-helper.service';
import { COLOR } from 'app/shared/utils/colors.service';
import { LaneOffsetInspector, LaneOffsetInspectorData } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { UpdateLaneOffsetDistanceCommand } from '../commands/update-lane-offset-distance-command';
import { CommandHistory } from 'app/services/command-history';
import { UpdateLaneOffsetValueCommand } from '../commands/update-lane-offset-value-command';
import { AddLaneOffsetCommand } from '../commands/add-lane-offset-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';

export class LaneOffsetTool extends BaseTool {

    public name: string = 'LaneOffset';

    private distanceSub: Subscription;
    private offsetSub: Subscription;

    private laneWidthChanged: boolean = false;
    private pointerDown: boolean = false;
    private pointerObject: Object3D;

    private lane: TvLane;
    private controlPoint: AnyControlPoint;
    private node: LaneOffsetNode;

    private laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.MAGENTA );

    constructor () {

        super();

    }

    init () {


    }

    enable () {

        super.enable();

        // this.distanceSub = LaneOffsetInspector.distanceChanged.subscribe( distance => {

        // const road = this.openDrive.getRoadById( data.node.roadId );

        // road.updateLaneOffsetValues();

        // NodeFactoryService.updateLaneOffsetNode( data.node );

        // this.rebuild( road );

        // } );

        this.distanceSub = LaneOffsetInspector.distanceChanged.subscribe( distance => {

            CommandHistory.execute( new UpdateLaneOffsetDistanceCommand( this.node, distance, null, this.laneHelper ) );

        } );


        this.offsetSub = LaneOffsetInspector.offsetChanged.subscribe( offset => {

            CommandHistory.execute( new UpdateLaneOffsetValueCommand( this.node, offset, null, this.laneHelper ) );

        } );

    }

    disable () {

        super.disable();

        if ( this.laneHelper ) this.laneHelper.clear();

        this.distanceSub.unsubscribe();

        this.openDrive.roads.forEach( road => this.hideNodes( road ) );
    }

    public onPointerDown ( e: PointerEventData ) {

        if ( e.button == MouseButton.RIGHT || e.button == MouseButton.MIDDLE ) return;

        this.pointerDown = true;

        const shiftKeyDown = KeyboardInput.isShiftKeyDown;

        let hasInteracted = false;

        // check for control point interactions first
        if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkNodePointInteraction( e );

        // // check for line segment interactions
        // if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkNodeLineInteraction( e );

        // check for lane game object interactions
        if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkLaneObjectInteraction( e );

        // if ( !hasInteracted ) hasInteracted = this.checkReferenceLineInteraction( e );

        // if ( hasInteracted ) {

        //     if ( this.controlPoint ) {

        //         AppInspector.setInspector( LaneWidthInspectorComponent, {

        //             node: this.controlPoint.parent as LaneWidthNode

        //         } );

        //     }

        // } else {

        //     // no interaction with line, lane, points etc
        //     if ( this.lane ) {

        //         this.hideNodes( this.openDrive.getRoadById( this.lane.roadId ) );

        //         this.laneHelper.clear();

        //         this.lane = null;

        //     }

        // }

    }

    public onPointerClicked ( e: PointerEventData ) {

        if ( e.button === MouseButton.LEFT && KeyboardInput.isShiftKeyDown && e.point != null ) {

            this.addNode( e.point );

        }
    }

    public onPointerUp () {

        // if ( this.laneWidthChanged && this.lane ) {

        //     const newPosition = new TvPosTheta();

        //     const road = TvMapQueries.getRoadByCoords( this.node.point.position.x, this.node.point.position.y, newPosition );

        //     // new road should be same
        //     if ( road.id === this.node.road.id ) {

        //         const command = new UpdateLaneOffsetDistanceCommand( this.node, newPosition.s, null, this.laneHelper );

        //         CommandHistory.execute( command );

        //     }

        // }

        this.pointerDown = false;

        this.pointerObject = null;

        this.laneWidthChanged = false;
    }

    public onPointerMoved ( e: PointerEventData ) {

        if ( this.pointerDown && this.node ) {

            this.laneWidthChanged = true;

            const newPosition = new TvPosTheta();

            const road = TvMapQueries.getRoadByCoords( e.point.x, e.point.y, newPosition );

            // new road should be same
            if ( road.id === this.node.road.id ) {

                const command = ( new UpdateLaneOffsetDistanceCommand( this.node, newPosition.s, null, this.laneHelper ) );

                command.execute();

            }

        }


        // if ( this.pointerDown && this.pointerObject && this.pointerObject[ 'tag' ] == LaneWidthNode.pointTag ) {

        //     this.laneWidthChanged = true;

        //     NodeFactoryService.updateLaneWidthNode( this.pointerObject.parent as LaneWidthNode, e.point );

        //     this.updateLaneWidth( this.pointerObject.parent as LaneWidthNode );

        //     if ( this.lane ) this.laneHelper.redraw( LineType.DASHED );

        // } else if ( this.pointerDown && this.pointerObject && this.pointerObject[ 'tag' ] == LaneWidthNode.lineTag ) {

        //     this.laneWidthChanged = true;

        //     NodeFactoryService.updateLaneWidthNode( this.pointerObject.parent as LaneWidthNode, e.point );

        //     this.updateLaneWidth( this.pointerObject.parent as LaneWidthNode );

        //     if ( this.lane ) this.laneHelper.redraw( LineType.DASHED );

        // }
    }

    private checkNodePointInteraction ( e: PointerEventData ): boolean {

        // // first chceck for control point interactions
        // // doing in 2 loop to prioritise control points
        const controlPoint = PickingHelper.checkControlPointInteraction( e, LaneOffsetNode.pointTag, 1.0 );

        if ( controlPoint ) {

            const node = controlPoint.parent as LaneOffsetNode;

            const road = this.openDrive.getRoadById( node.roadId );

            CommandHistory.executeMany(

                new SetValueCommand( this, 'controlPoint', controlPoint ),

                new SetValueCommand( this, 'node', node ),

                new SetInspectorCommand( LaneOffsetInspector, new LaneOffsetInspectorData( node, road ) ),

            );

        } else if ( this.controlPoint ) {

            CommandHistory.executeMany(

                new SetValueCommand( this, 'controlPoint', null ),

                new SetValueCommand( this, 'node', null ),

                new SetInspectorCommand( null, null ),

            );

        }

        // 4 scenarios
        // old and new both present then check is new or not 
        // old and new is null
        // old is null and new 
        // old is null and new is null

        // if ( this.controlPoint && controlPoint && this.controlPoint.id != controlPoint.id ) {

        //     this.controlPoint.unselect();

        //     this.controlPoint = controlPoint;

        //     this.controlPoint.select();

        //     AppInspector.setInspector( LaneOffsetInspector, new LaneOffsetInspectorData( this.controlPoint.parent as LaneOffsetNode ) );

        // } else if ( this.controlPoint && !controlPoint ) {

        //     this.controlPoint.unselect();

        //     this.controlPoint = null;

        //     AppInspector.clear();

        // } else if ( !this.controlPoint && controlPoint ) {

        //     this.controlPoint = controlPoint;

        //     this.controlPoint.select();

        //     AppInspector.setInspector( LaneOffsetInspector, new LaneOffsetInspectorData( this.controlPoint.parent as LaneOffsetNode ) );

        // } else if ( !this.controlPoint && !controlPoint ) {

        //     AppInspector.clear();

        // }

        return controlPoint != null;
    }

    private checkNodeLineInteraction ( e: PointerEventData ) {

        // let hasInteracted = false;

        // // check for line segment interactions
        // for ( let i = 0; i < e.intersections.length; i++ ) {

        //     const intersection = e.intersections[ i ];

        //     if ( e.button === MouseButton.LEFT && intersection.object && intersection.object[ 'tag' ] == 'width-line' ) {

        //         hasInteracted = true;

        //         // const road = intersection.object.userData.road;

        //         // // check if old or a new road is selected
        //         // if ( !this.road || this.road.id != road.id ) {

        //         //     this.road = road;

        //         //     this.road.spline.show();

        //         // }

        //         break;
        //     }
        // }

        // return hasInteracted;
    }

    private checkLaneObjectInteraction ( e: PointerEventData ): boolean {

        const newLane = PickingHelper.checkLaneObjectInteraction( e );

        if ( newLane ) {

            const road = this.openDrive.getRoadById( newLane.roadId );

            CommandHistory.executeMany(

                new SetValueCommand( this, 'lane', newLane ),

                new SetInspectorCommand( LaneOffsetInspector, new LaneOffsetInspectorData( null, road ) )

            );

        } else if ( this.lane ) {

            CommandHistory.executeMany(

                new SetValueCommand( this, 'lane', null ),

                new SetInspectorCommand( null, null ),

            );

        }

        // lane exists new not found -> 1 clear
        // lane exists new found    -> 2 change
        // lane does not exist new found     -> set new
        // lane does not exist and new not found => nothing

        // if ( this.lane && newLane == null ) {

        //     this.hideNodes( this.openDrive.getRoadById( this.lane.roadId ) );

        //     this.laneHelper.clear();

        //     this.lane = null;

        // } else if ( this.lane && newLane && this.lane.roadId != newLane.roadId ) {

        //     this.hideNodes( this.openDrive.getRoadById( this.lane.roadId ) );

        //     this.laneHelper.clear();

        //     this.lane = newLane;

        //     const newRoad = this.openDrive.getRoadById( newLane.roadId );

        //     this.showNodes( newRoad );

        //     this.laneHelper.drawRoad( newRoad, LineType.SOLID );

        // } else if ( !this.lane && newLane ) {

        //     this.lane = newLane;

        //     const newRoad = this.openDrive.getRoadById( newLane.roadId );

        //     this.showNodes( newRoad );

        //     this.laneHelper.drawRoad( newRoad, LineType.SOLID );


        // } else if ( !this.lane && newLane == null ) {

        //     // do nothing

        // }

        return newLane != null;
    }

    private checkReferenceLineInteraction ( e: PointerEventData ) {

        // let hasInteracted = false;

        // this.checkIntersection( this.laneHelper.tag, e.intersections, ( obj ) => {

        //     hasInteracted = true;

        //     this.laneHelper.onLineSelected( obj as Line );

        // } );

        // return hasInteracted;
    }

    private addNode ( position: Vector3 ): void {

        if ( !this.lane ) return;

        const road = this.openDrive.getRoadById( this.lane.roadId );

        const posTheta = new TvPosTheta();

        // getting position on track in s/t coordinates
        TvMapQueries.getRoadByCoords(
            position.x,
            position.y,
            posTheta
        );

        const laneOffset = road.getLaneOffsetAt( posTheta.s ).clone( posTheta.s );

        const node = NodeFactoryService.createLaneOffsetNode( road, laneOffset );

        CommandHistory.executeMany(

            new AddLaneOffsetCommand( node ),

            new SetInspectorCommand( LaneOffsetInspector, new LaneOffsetInspectorData( node, road ) ),

        );

        // // getting position on track in s/t coordinates
        // TvMapQueries.getRoadByCoords(
        //     position.x,
        //     position.y,
        //     posTheta
        // );

        // // // get the exisiting lane Offset at s
        // // // and clone the lane Offset 
        // const newLaneOffset = road.getLaneOffsetAt( posTheta.s ).clone( posTheta.s );

        // // // add the with back to lane to 
        // // this.lane.addOffsetRecordInstance( newLaneOffset );
        // road.addLaneOffsetInstance( newLaneOffset );

        // // // make mesh for the lane Offset node
        // // const laneOffsetNode = newLaneOffset.mesh = NodeFactoryService.createLaneOffsetNode(
        // //     this.lane.roadId, this.lane.id, newLaneOffset.s, newLaneOffset
        // // );
        // const node = newLaneOffset.mesh = NodeFactoryService.createLaneOffsetNode( road, newLaneOffset );

        // // // add it to scene to enable rendering
        // // SceneService.add( newLaneOffset.mesh );
        // SceneService.add( node );

        // // set the node in inpsector
        // AppInspector.setInspector( LaneOffsetInspector, new LaneOffsetInspectorData( node, road ) );

        // this.rebuild( road );

    }

    private updateLaneWidth ( node: LaneWidthNode ) {

        // if ( !node ) return;

        // if ( !this.lane ) return;

        // const road = this.openDrive.getRoadById( node.roadId );

        // road.getLaneSectionAt( node.s ).updateLaneWidthValues( this.lane );
    }

    private hideNodes ( road: TvRoad ): void {

        road.getLaneOffsets().forEach( laneOffset => {

            if ( laneOffset.mesh ) {

                laneOffset.mesh.visible = false;

            }

        } );

    }

    private showNodes ( road: TvRoad ) {

        road.getLaneOffsets().forEach( laneOffset => {

            if ( laneOffset.mesh ) {

                laneOffset.mesh.visible = true;

            } else {

                laneOffset.mesh = NodeFactoryService.createLaneOffsetNode( road, laneOffset );

                SceneService.add( laneOffset.mesh );

            }

        } );

    }

    private rebuild ( road: TvRoad ): void {

        if ( !this.lane ) return;

        SceneService.removeWithChildren( road.gameObject, true );

        TvMapBuilder.buildRoad( this.openDrive.gameObject, road );

        this.laneHelper.redraw( LineType.SOLID );
    }
}
