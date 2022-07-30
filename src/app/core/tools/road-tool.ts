/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { ObjectTypes, TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { Vector3 } from 'three';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { NodeFactoryService } from '../factories/node-factory.service';
import { RoadFactory } from '../factories/road-factory.service';
import { CommandHistory } from 'app/services/command-history';
import { AddRoadPointCommand } from 'app/core/commands/add-road-point-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { MultiCmdsCommand } from 'app/core/commands/multi-cmds-command';
import { AddRoadCommand } from 'app/core/commands/add-road-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { UpdateRoadPointCommand } from 'app/core/commands/update-road-point-command';
import { JoinRoadNodeCommand } from '../commands/join-road-node-command';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';

export class RoadTool extends BaseTool {

    public name: string = 'RoadTool';

    private road: TvRoad;
    private controlPoint: RoadControlPoint;
    private node: RoadNode;

    private roadChanged: boolean = false;
    private pointerDown: boolean = false;
    private pointerDownAt: Vector3;

    constructor () {

        super();

    }

    init () {


    }

    enable () {

        super.enable();

        this.map.roads.forEach( road => {

            if ( !road.isJunction ) {

                NodeFactoryService.updateRoadNodes( road );

                road.showNodes();

            }

        } );

    }

    disable () {

        super.disable();

        this.map.roads.forEach( road => road.hideNodes() );

        if ( this.road ) this.hideRoad( this.road );

        if ( this.controlPoint ) this.controlPoint.unselect();

        if ( this.node ) this.node.unselected();
    }

    onPointerDown ( e: PointerEventData ) {

        if ( e.button == MouseButton.RIGHT || e.button == MouseButton.MIDDLE ) return;

        this.pointerDown = true;

        this.pointerDownAt = e.point ? e.point.clone() : null;

        const shiftKeyDown = KeyboardInput.isShiftKeyDown;

        let hasInteracted = false;

        if ( !hasInteracted ) hasInteracted = this.checkControlPointInteraction( e );

        if ( !hasInteracted ) hasInteracted = this.checkRoadNodeInteraction( e );

        if ( !hasInteracted && !shiftKeyDown ) hasInteracted = this.checkLaneObjectInteraction( e );

        if ( !hasInteracted ) {

            if ( e.button === MouseButton.LEFT && shiftKeyDown && e.point != null ) {

                this.addControlPoint( e.point );

            } else {

                if ( this.road || this.controlPoint || this.node ) {

                    const setInspectorCommand = new SetInspectorCommand( null, null );

                    const setRoadCommand = new SetValueCommand( this, 'road', null );

                    const setPointCommand = new SetValueCommand( this, 'controlPoint', null );

                    const setNodeCommand = new SetValueCommand( this, 'node', null );

                    CommandHistory.execute( new MultiCmdsCommand( [
                        setInspectorCommand,
                        setRoadCommand,
                        setPointCommand,
                        setNodeCommand
                    ] ) );

                }

            }

            // // no interaction with line, lane, points etc
            // if ( this.road && !this.controlPoint && !shiftKeyDown ) {

            //     AppInspector.clear();

            //     this.hideRoad( this.road );

            //     this.road = null;
            // }

            // if ( this.controlPoint && !shiftKeyDown ) {

            //     this.controlPoint.unselect();

            //     this.controlPoint = null;

            // }

        }

        // AppInspector.setInspector( RoadInspector, {
        //     road: this.road,
        //     controlPoint: this.controlPoint
        // } );
    }

    onPointerClicked ( e: PointerEventData ) {

        // no need to do chck creation logic here, as it caused bugs, moved it in onPointerDown

        // if ( e.button === MouseButton.LEFT && KeyboardInput.isShiftKeyDown && e.point != null ) {

        //     this.checkRoadNodeInteraction( e );

        //     this.addControlPoint( e.point );

        // }
    }

    onPointerUp ( e: PointerEventData ) {

        if ( this.roadChanged && this.road && this.road.spline.controlPoints.length >= 2 ) {

            const updateRoadPointCommand = new UpdateRoadPointCommand(
                this.road, this.controlPoint, this.controlPoint.position, this.pointerDownAt
            );

            CommandHistory.execute( updateRoadPointCommand );

        }

        this.pointerDown = false;

        this.pointerDownAt = null;

        this.roadChanged = false;
    }

    onPointerMoved ( e: PointerEventData ) {

        if ( this.pointerDown && this.controlPoint && this.controlPoint.isSelected && this.road ) {

            this.controlPoint.copyPosition( e.point );

            this.road.spline.update();

            this.roadChanged = true;

            this.updateSuccessor( this.road, this.controlPoint );

            this.updatePredecessor( this.road, this.controlPoint );
        }

    }

    private updateSuccessor ( road: TvRoad, currentPoint: RoadControlPoint ) {

        const P1 = road.spline.getSecondLastPoint() as RoadControlPoint;
        const P2 = road.spline.getLastPoint() as RoadControlPoint;

        if ( road.successor && road.successor.elementType !== "junction"
            && ( P1.id === currentPoint.id || P2.id === currentPoint.id ) ) {

            const successor = this.map.getRoadById( road.successor.elementId );

            if ( !successor ) return;

            successor.spline.show();

            let P3: RoadControlPoint;

            let P4: RoadControlPoint;

            let newP4: RoadControlPoint;

            let distance: number;

            if ( road.successor.contactPoint === TvContactPoint.START ) {

                P3 = successor.spline.controlPoints[ 0 ] as RoadControlPoint;

                P4 = successor.spline.controlPoints[ 1 ] as RoadControlPoint;

                distance = P3.position.distanceTo( P4.position );

                P3.copyPosition( P2.position );

                P2.hdg = P3.hdg = P1.hdg;

                newP4 = P2.moveForward( distance );

                P4.copyPosition( newP4.position );

                successor.spline.update();

            } else {

                P3 = successor.spline.getLastPoint() as RoadControlPoint;

                P4 = successor.spline.getSecondLastPoint() as RoadControlPoint;

                distance = P3.position.distanceTo( P4.position );

                P3.copyPosition( P2.position );

                P2.hdg = P1.hdg;

                P3.hdg = P2.hdg + Math.PI;

                newP4 = P2.moveForward( distance );

                P4.copyPosition( newP4.position );

                successor.spline.update();
            }
        }
    }

    private updatePredecessor ( road: TvRoad, currentPoint: RoadControlPoint ) {

        const P1 = road.spline.controlPoints[ 1 ] as RoadControlPoint;
        const P2 = road.spline.controlPoints[ 0 ] as RoadControlPoint;

        if ( road.predecessor && road.predecessor.elementType !== "junction"
            && ( P1.id === currentPoint.id || P2.id === currentPoint.id ) ) {

            const predecessor = this.map.getRoadById( road.predecessor.elementId );

            if ( !predecessor ) return;

            predecessor.spline.show();

            let P3: RoadControlPoint;

            let P4: RoadControlPoint;

            let newP4: RoadControlPoint;

            let distance: number;

            if ( road.predecessor.contactPoint === TvContactPoint.START ) {

                P3 = predecessor.spline.controlPoints[ 0 ] as RoadControlPoint;

                P4 = predecessor.spline.controlPoints[ 1 ] as RoadControlPoint;

                distance = P3.position.distanceTo( P4.position );

                P3.copyPosition( P2.position );

                P3.hdg = P4.hdg = P2.hdg + Math.PI;

                newP4 = P3.moveForward( distance );

                P4.copyPosition( newP4.position );

                predecessor.spline.update();

            } else {

                P3 = predecessor.spline.getLastPoint() as RoadControlPoint;

                P4 = predecessor.spline.getSecondLastPoint() as RoadControlPoint;

                distance = P3.position.distanceTo( P4.position );

                P3.copyPosition( P2.position );

                P3.hdg = P4.hdg = P2.hdg + Math.PI;

                newP4 = P3.moveForward( distance );

                P4.copyPosition( newP4.position );

                predecessor.spline.update();

            }
        }
    }

    private checkControlPointInteraction ( e: PointerEventData ): boolean {

        if ( !this.road || !this.road.spline ) return;

        if ( !e.point ) return;

        // // first chceck for control point interactions
        // // doing in 2 loop to prioritise control points
        // let controlPoint = PickingHelper.checkControlPointInteraction( e, ControlPoint.roadTag, 1 );

        const maxDistance = Math.max( 0.5, e.approxCameraDistance * 0.01 );

        const controlPoints = [];

        this.road.spline.controlPoints.forEach( ( cp: RoadControlPoint ) => {

            controlPoints.push( cp );

            if ( cp.frontTangent ) controlPoints.push( cp.frontTangent );

            if ( cp.backTangent ) controlPoints.push( cp.backTangent );

        } );

        const controlPoint = PickingHelper.findNearest( e.point, controlPoints, maxDistance );

        if ( controlPoint ) {

            CommandHistory.executeAll( [

                new SetInspectorCommand( RoadInspector, { road: this.road, controlPoint } ),

                new SetValueCommand( this, 'controlPoint', controlPoint ),

                new SetValueCommand( this, 'node', null )

            ] );

        } else if ( this.controlPoint ) {

            CommandHistory.executeAll( [

                new SetValueCommand( this, 'controlPoint', null ),

                new SetInspectorCommand( null, null ),

            ] );

        }

        return controlPoint != null;
    }

    private checkLaneObjectInteraction ( e: PointerEventData ): boolean {

        let hasInteracted = false;

        for ( let i = 0; i < e.intersections.length; i++ ) {

            const intersection = e.intersections[ i ];

            // tslint:disable-next-line: no-string-literal
            if ( intersection.object && intersection.object[ 'tag' ] === ObjectTypes.LANE ) {

                hasInteracted = true;

                if ( intersection.object.userData.lane ) {

                    const lane = intersection.object.userData.lane as TvLane;

                    const road = this.map.getRoadById( lane.roadId );

                    if ( road.isJunction ) continue;

                    // check if old or a new lane is selected
                    if ( !this.road || this.road.id !== road.id ) {

                        const commands = [];

                        commands.push( new SetInspectorCommand( RoadInspector, { road } ) );

                        commands.push( new SetValueCommand( this, 'road', road ) );

                        commands.push( new SetValueCommand( this, 'controlPoint', null ) );

                        commands.push( new SetValueCommand( this, 'node', null ) );

                        CommandHistory.execute( new MultiCmdsCommand( commands ) );
                    }
                }

                break;
            }
        }

        return hasInteracted;
    }

    private checkRoadNodeInteraction ( e: PointerEventData ): boolean {

        let hasInteracted = false;

        // for now ignore the shift key 
        const shiftKeyDown = true; //KeyboardInput.isShiftKeyDown;

        for ( let i = 0; i < e.intersections.length; i++ ) {

            const intersection = e.intersections[ i ];

            if ( intersection.object && intersection.object[ 'tag' ] === RoadNode.lineTag ) {

                hasInteracted = true;

                const node = intersection.object.parent as RoadNode;

                if ( shiftKeyDown && this.node && this.node.roadId !== node.roadId ) {

                    // node with node then

                    // two roads need to joined
                    // we take both nodes and use them as start and end points
                    // for a new road
                    // new road will have 4 more points, so total 6 points

                    this.joinNodeWithNode( this.node, node );

                } else if ( shiftKeyDown && this.controlPoint ) {

                    // control point with node
                    // modify the control point road and join it the the node road
                    // console.log( "only join roads", this.road.id, node.roadId );


                    // another scenario of first node selected then controlpoint
                    // in this
                    // create new road and normally but with node as the first point
                    // and second point will be forward distance of x distance
                    // then 3rd point will be created wherever the point was selected

                } else {

                    // this only selects the node

                    const road = this.map.getRoadById( node.roadId );

                    CommandHistory.executeAll( [

                        new SetInspectorCommand( RoadInspector, { road, node } ),

                        new SetValueCommand( this, 'node', node ),

                        new SetValueCommand( this, 'road', road ),

                        new SetValueCommand( this, 'conrolPoint', null ),

                    ] );

                }


                break;
            }
        }

        if ( !hasInteracted && this.node ) {

            this.node.unselected();

            this.node = null;

        }

        return hasInteracted;
    }

    private updateRoadGeometry ( road: TvRoad ): void {

        road.spline.update();

        this.map.gameObject.remove( road.gameObject );

        // remove old geometries
        road.clearGeometries();

        // TODO: can be improved 
        road.spline.exportGeometries().forEach( geometry => {

            road.addGeometry( geometry );

        } );

        TvMapBuilder.buildRoad( this.map.gameObject, road );

        NodeFactoryService.updateRoadNodes( this.road );
    }

    private hideRoad ( road: TvRoad ): void {

        road.spline.hide();

    }

    private showRoad ( road: TvRoad ): void {

        road.spline.show();

    }

    private addControlPoint ( position: Vector3 ) {

        // // unselect old if exists
        // if ( this.controlPoint ) this.controlPoint.unselect();

        if ( !this.road ) {

            const result = RoadFactory.createRoad( position );

            const addRoadCommand = new AddRoadCommand( result.road, result.point );

            const setRoadCommand = new SetValueCommand( this, 'road', result.road );

            const setPointCommand = new SetValueCommand( this, 'controlPoint', result.point );

            CommandHistory.execute( new MultiCmdsCommand( [ addRoadCommand, setRoadCommand, setPointCommand ] ) );

        } else {

            const controlPoint = RoadFactory.addControlPoint( this.road, position );

            const setPointCommand = new SetValueCommand( this, 'controlPoint', controlPoint );

            const addPointCommand = new AddRoadPointCommand( this.road, controlPoint, this.controlPoint );

            CommandHistory.execute( new MultiCmdsCommand( [ addPointCommand, setPointCommand ] ) );
        }

        // if ( !this.road ) this.road = this.openDrive.addDefaultRoad();


        // // set new
        // this.controlPoint = ControlPoint.create( "", position );

        // // TODO: spline should take this responsibility
        // SceneService.add( this.controlPoint );

        // this.controlPoint.mainObject = this.controlPoint.userData.road = this.road;

        // this.road.spline.addControlPoint( this.controlPoint );

        // this.controlPoint.onSelected();

        // if ( this.road.spline.controlPoints.length < 2 ) return;

        // this.updateRoadGeometry( this.road );

        // AppInspector.setInspector( RoadInspector, {
        //     road: this.road,
        //     controlPoint: this.controlPoint
        // } );
    }

    private joinNodeWithNode ( firstNode: RoadNode, secondNode: RoadNode ) {

        // console.log( "crate new road to join ", firstNode.roadId, secondNode.roadId );

        const commands = [];

        commands.push( new SetValueCommand( this, 'node', null ) );

        commands.push( new SetValueCommand( this, 'road', null ) );

        commands.push( new SetValueCommand( this, 'conrolPoint', null ) );

        commands.push( new JoinRoadNodeCommand( firstNode, secondNode ) );

        CommandHistory.execute( new MultiCmdsCommand( commands ) );

    }

    private joinPointWithNode () {

    }

    private joinNodeWithPoint () {

    }
}