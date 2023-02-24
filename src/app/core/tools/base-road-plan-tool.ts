/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Subscription } from 'rxjs';
import { PointerEventData } from '../../events/pointer-event-data';
import { AnyControlPoint } from '../../modules/three-js/objects/control-point';
import { TvAbstractRoadGeometry } from '../../modules/tv-map/models/geometries/tv-abstract-road-geometry';
import { TvColors, TvLaneSide, TvLaneType, TvRoadMarkTypes, TvRoadMarkWeights } from '../../modules/tv-map/models/tv-common';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { TvMapInstance } from '../../modules/tv-map/services/tv-map-source-file';
import { RoadInspector } from '../../views/inspectors/road-inspector/road-inspector.component';
import { AbstractShapeEditor } from '../editors/abstract-shape-editor';
import { PointEditor } from '../editors/point-editor';
import { RoadPlanHelper } from '../helpers/road-plan-helper';
import { KeyboardInput } from '../input';
import { AppInspector } from '../inspector';
import { BaseTool } from './base-tool';

export class BaseRoadPlanTool extends BaseTool {

    name: string = 'RoadPlan';
    onKeyDownSub: Subscription;
    protected controlPointSelectedSubscriber: Subscription;
    protected controlPointUnselectedSubscriber: Subscription;
    protected controlPointAddedSubscriber: Subscription;
    protected controlPointMovedSubscriber: Subscription;
    protected controlPointUpdatedSubscriber: Subscription;
    protected shapeEditor: AbstractShapeEditor;
    protected road: TvRoad;
    protected roadAdded: boolean;
    protected helper: RoadPlanHelper;

    constructor () {

        super();

        this.shapeEditor = new PointEditor();
    }

    init () {

        super.init();

    }

    enable (): void {

        super.enable();

        this.controlPointSelectedSubscriber = this.shapeEditor.controlPointSelected.subscribe( e => this.onControlPointSelected( e ) );
        this.controlPointUnselectedSubscriber = this.shapeEditor.controlPointUnselected.subscribe( e => this.onControlPointUnselected( e ) );
        this.controlPointAddedSubscriber = this.shapeEditor.controlPointAdded.subscribe( e => this.onControlPointAdded( e ) );
        this.controlPointMovedSubscriber = this.shapeEditor.controlPointMoved.subscribe( e => this.onControlPointMoved( e ) );
        this.controlPointUpdatedSubscriber = this.shapeEditor.controlPointUpdated.subscribe( e => this.onControlPointUpdated( e ) );

        this.onKeyDownSub = KeyboardInput.keyDown.subscribe( e => {

            if ( e.key === 'Delete' ) {

                this.unselectRoad( this.road );

                this.road.remove( TvMapInstance.map.gameObject );

                TvMapInstance.map.deleteRoad( this.road.id );

                this.road = null;

            }

        } );
    }

    disable (): void {

        super.disable();

        this.controlPointSelectedSubscriber.unsubscribe();
        this.controlPointUnselectedSubscriber.unsubscribe();
        this.controlPointAddedSubscriber.unsubscribe();
        this.controlPointMovedSubscriber.unsubscribe();
        this.controlPointUpdatedSubscriber.unsubscribe();

        if ( this.onKeyDownSub ) this.onKeyDownSub.unsubscribe();

        this.shapeEditor.destroy();

    }

    onPointerClicked ( e: PointerEventData ) {

        let hasInteracted = false;

        this.checkControlPointIntersection( e.intersections, ( point ) => {

            hasInteracted = true;

            this.shapeEditor.selectControlPoint( point as AnyControlPoint );

        } );

        if ( hasInteracted ) return;

        this.checkRoadIntersection( e.intersections, ( object ) => {

            hasInteracted = true;

            this.selectRoad( object.userData.road );

        } );

        if ( hasInteracted ) return;

        // Finally, If no objects were intersected then clear the inspector
        if ( !KeyboardInput.isShiftKeyDown ) this.clickedOutside();
    }

    onPointerMoved ( e: PointerEventData ) {

        let hoveringPoint: AnyControlPoint = null;

        let selectectPoint: AnyControlPoint = this.shapeEditor.currentPoint;

        this.checkControlPointIntersection( e.intersections, cp => hoveringPoint = cp );

        let points: AnyControlPoint[] = [];

        if ( selectectPoint ) {

            points = this.shapeEditor.controlPoints.filter( cp => cp.id != selectectPoint.id );

        } else {

            points = this.shapeEditor.controlPoints;

        }

        if ( hoveringPoint ) {

            if ( !selectectPoint || selectectPoint.id != hoveringPoint.id ) {
                this.shapeEditor.onControlPointHovered( hoveringPoint );
            }

            points = points.filter( i => i.id != hoveringPoint.id );

        }

        points.forEach( p => this.shapeEditor.onControlPointUnhovered( p ) );

    }

    public addDefaultLanes ( road: TvRoad ) {

        road.addLaneSection( 0, false );

        const laneSection = road.getLastAddedLaneSection();

        const leftLane3 = laneSection.addLane( TvLaneSide.LEFT, 3, TvLaneType.sidewalk, true, true );
        const leftLane2 = laneSection.addLane( TvLaneSide.LEFT, 2, TvLaneType.shoulder, true, true );
        const leftLane1 = laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, true, true );
        const centerLane = laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, true, true );
        const rightLane1 = laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, true, true );
        const rightLane2 = laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.shoulder, true, true );
        const rightLane3 = laneSection.addLane( TvLaneSide.RIGHT, -3, TvLaneType.sidewalk, true, true );

        leftLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
        centerLane.addRoadMarkRecord( 0, TvRoadMarkTypes.BROKEN, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );
        rightLane1.addRoadMarkRecord( 0, TvRoadMarkTypes.NONE, TvRoadMarkWeights.STANDARD, TvColors.STANDARD, 0.15, 'none', 0 );

        laneSection.getLaneVector().forEach( lane => {

            if ( lane.side !== TvLaneSide.CENTER ) {

                if ( lane.type == TvLaneType.driving ) {
                    lane.addWidthRecord( 0, 3.6, 0, 0, 0 );
                } else if ( lane.type == TvLaneType.sidewalk ) {
                    lane.addWidthRecord( 0, 2, 0, 0, 0 );
                } else {
                    lane.addWidthRecord( 0, 0.5, 0, 0, 0 );
                }

            }

        } );

        this.selectRoad( road );

    }

    protected clickedOutside () {

        this.road == null;

        AppInspector.clear();

        // this.shapeEditor.removeAllControlPoints();

    }

    protected onControlPointSelected ( e: AnyControlPoint ) {
    }

    protected onControlPointUnselected ( e: AnyControlPoint ) {
    }

    protected onControlPointAdded ( e: AnyControlPoint ) {
    }

    protected onControlPointMoved ( e: AnyControlPoint ) {
    }

    protected onControlPointUpdated ( e: AnyControlPoint ) {
    }

    protected getRoadIdFromControlPoint ( e: AnyControlPoint ) {
        return e.userData.roadId;
    }

    //
    // // TODO: Handle multiple openDrive geometry type
    // // currently only handles bezier cube
    // onRoadGeometryChanged ( e: THREE.Curve<any> ) {
    //
    //     // this.lineGeometry( e as LineCurve3 );
    //
    //     // this.addParamPoly3( e as CubicBezierCurve3 );
    //
    // }
    //
    // onRoadGeometryAdded ( e: THREE.Curve<any> ) {
    //
    //
    // }
    //
    // lineGeometry ( line: LineCurve3 ) {
    //
    //     // return;
    //
    //     // TODO: Do this from openDrive class
    //     // this.road = new OdRoad( 'road', 0, 1, -1 );
    //
    //     const p1 = line.v1;
    //     const p2 = line.v2;
    //     const hdg = Math.atan2( p2.y - p1.y, p2.x - p1.x );
    //     const length = line.getLength();
    //
    //
    //     if ( !this.roadAdded ) {
    //
    //         const roadId = this.openDrive.getRoadCount() + 2;
    //
    //         this.road = this.openDrive.addRoad( '', length, roadId, -1 );
    //
    //         this.road.addPlanView();
    //
    //         this.addDefaultLanes( this.road );
    //
    //         const s = 0;
    //
    //         this.road.planView.addGeometryLine( s, p1.x, p1.y, hdg, length );
    //
    //         this.roadAdded = true;
    //
    //     } else {
    //
    //         this.road.attr_length = length;
    //
    //         const last = this.road.planView.geometries[ this.road.planView.geometries.length - 1 ];
    //
    //         last.x = p1.x;
    //         last.y = p1.y;
    //         last.hdg = hdg;
    //         last.length = length;
    //
    //         // this.road.planView.addGeometryLine( s, p1.x, p1.y, hdg, length );
    //     }
    //
    //     OdSourceFile.roadNetworkChanged.emit( OdSourceFile.openDrive );
    // }

    protected setRoadIdOnControlPoint ( e: AnyControlPoint, road: TvRoad ) {
        e.userData.roadId = road.id;
    }

    protected selectRoad ( road: TvRoad ) {

        this.unselectRoad( this.road );

        this.road = road;

        // skip if the same road is selected
        // if ( road.id == this.road.id ) return;

        let controlPoint = this.shapeEditor.currentPoint;

        let node = null;

        AppInspector.setInspector( RoadInspector, { road, controlPoint, node } );

        this.showRoadControlPoints( road, 'auto' );
    }

    protected unselectRoad ( road: TvRoad ) {

        if ( !road ) return;

        this.road.spline.hide();

    }

    protected selectRoadControlPoint ( controlPoint?: AnyControlPoint, node?: any ) {

        // skip if the same control point is selected
        // if ( this.shapeEditor.currentPoint.id == controlPoint.id ) return;

        let road = this.road;

        AppInspector.setInspector( RoadInspector, { road, controlPoint, node } );
    }

    protected showRoadControlPoints ( road: TvRoad, type: 'auto' | 'explicit' = 'auto' ) {

        road.getPlanView();

        if ( type == 'auto' ) {

            //

        }

    }

    // private addParamPoly3 ( curve: CubicBezierCurve3 ) {
    //
    //     const x = curve.v0.x;
    //     const y = curve.v0.y;
    //
    //     const hdg = 0;
    //     const length = curve.getLength();
    //
    //     const a = new Vector3();
    //     const b = curve.v1;
    //     const c = curve.v2;
    //     const d = curve.v3;
    //
    //     if ( !this.roadAdded ) {
    //
    //         const roadId = this.openDrive.getRoadCount() + 2;
    //
    //         this.road = this.openDrive.addRoad( '', length, roadId, -1 );
    //
    //         this.road.addPlanView();
    //
    //         this.addDefaultLanes( this.road );
    //
    //         const s = 0;
    //
    //         this.road.planView.addGeometryParamPoly3( 0, x, y, hdg, length, a.x, b.x, c.x, d.x, a.y, b.y, c.y, d.y );
    //         // this.road.planView.addGeometryPoly3( 0, x, y, hdg, length, a.y, b.y, c.y, d.y );
    //
    //         this.roadAdded = true;
    //
    //     } else {
    //
    //         this.road.attr_length = length;
    //
    //         const last = this.road.planView.geometries[ this.road.planView.geometries.length - 1 ] as OdParamPoly3Geometry;
    //
    //         last.x = x;
    //         last.y = y;
    //         last.hdg = hdg;
    //         last.length = length;
    //
    //         last.aU = a.x;
    //         last.bU = b.x;
    //         last.cU = c.x;
    //         last.dU = d.x;
    //
    //         last.aV = a.y;
    //         last.bV = b.y;
    //         last.cV = c.y;
    //         last.dV = d.y;
    //
    //         // this.road.planView.addGeometryLine( s, p1.x, p1.y, hdg, length );
    //     }
    //
    //     OdSourceFile.roadNetworkChanged.emit( OdSourceFile.openDrive );
    //
    // }


    protected createRoad () {

        const roadId = this.map.getRoadCount() + 1;
        const road = this.map.addRoad( '', 0, roadId, -1 );

        road.addPlanView();

        this.addDefaultLanes( road );

        return road;
    }

    private addGeometry ( road: TvRoad, geometry: TvAbstractRoadGeometry ) {

        road.planView.addGeometry( geometry );

        TvMapInstance.mapChanged.emit( TvMapInstance.map );
    }
}
