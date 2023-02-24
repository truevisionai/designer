/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';
import { Subscription } from 'rxjs';
import { TvRoadSignal } from 'app/modules/tv-map/models/tv-road-signal.model';
import { AbstractShapeEditor } from '../editors/abstract-shape-editor';
import { PointEditor } from '../editors/point-editor';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvObjectType } from 'app/modules/tv-map/interfaces/i-tv-object';
import { Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, TextureLoader, Euler, ArrowHelper, Vector3, Quaternion } from 'three';
import { OdSignalInspectorComponent } from 'app/views/inspectors/signal-inspector/signal-inspector.component';
import { AnyControlPoint, SimpleControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvOrientation, TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { SnackBar } from 'app/services/snack-bar.service';
import { MarkingTypes, TvMarkingService } from 'app/modules/tv-map/services/tv-marking.service';
import { TvRoadMarking } from "app/modules/tv-map/models/tv-road-marking";
import { TvRoadObject } from 'app/modules/tv-map/models/tv-road-object';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { Maths } from 'app/utils/maths';
import * as THREE from 'three';
import { TvPointMarking } from 'app/modules/tv-map/models/tv-point-road-marking';

export abstract class BaseMarkingTool extends BaseTool {

}

export class MarkingPointTool extends BaseMarkingTool {

    name: string = 'MarkingPointTool';

    private shapeEditor: AbstractShapeEditor = new PointEditor();
    private hasSignal = false;
    private selectedSignal: TvRoadSignal;
    private cpSubscriptions: Subscription[] = [];

    private controlPointAddedSubscriber: Subscription;
    private controlPointSelectedSubscriber: Subscription;

    private currentMarking: TvRoadMarking;

    constructor () {

        super();

    }

    get marking () {

        return TvMarkingService.currentMarking;

    }

    init () {

        super.init();

        this.showPointMarkings();

    }

    enable () {

        super.enable();

        this.controlPointAddedSubscriber = this.shapeEditor.controlPointAdded.subscribe( e => this.onControlPointAdded( e ) );
        this.controlPointSelectedSubscriber = this.shapeEditor.controlPointSelected.subscribe( e => this.onControlPointSelected( e ) );

    }

    disable (): void {

        super.disable();

        this.controlPointAddedSubscriber.unsubscribe();

        this.shapeEditor.destroy();

        this.unsubscribeFromControlPoints();

    }

    // onPointerDown ( e: PointerEventData ) {

    //     super.onPointerDown( e );

    //     this.hasSignal = false;

    //     for ( const i of e.intersections ) {

    //         if ( i.object[ 'OpenDriveType' ] != null && i.object[ 'OpenDriveType' ] == TvObjectType.SIGNAL ) {

    //             this.hasSignal = true;

    //             this.inspectSignal( i.object );

    //             break;

    //         }
    //     }

    //     if ( !this.hasSignal ) {

    //         this.clearInspector();

    //     }
    // }

    // private inspectSignal ( object: Object3D ) {

    //     this.selectedSignal = ( object.userData.data as TvRoadSignal );

    //     this.setInspector( OdSignalInspectorComponent, this.selectedSignal );
    // }

    private onControlPointAdded ( point: SimpleControlPoint<TvPointMarking> ) {

        if ( !this.marking ) SnackBar.error( "Select a marking from project browser" );

        if ( !this.marking ) this.shapeEditor.removeControlPoint( point );

        if ( !this.marking ) return;

        const pose = new TvPosTheta();

        pose.x = point.position.x;

        pose.y = point.position.y;

        const result = TvMapQueries.getLaneCenterPosition( point.position );

        const road = result.road;

        const lane = result.lane;

        if ( !road ) SnackBar.error( 'Marking can be added only on road mesh' );

        if ( !road ) this.shapeEditor.removeControlPoint( point );

        if ( !road ) return;

        if ( this.marking && this.marking.type === MarkingTypes.point ) {

            // const marking = point.mainObject = this.marking.clone();

            const marking = point.mainObject = new TvPointMarking( "", this.marking.textureGuid, lane );

            marking.controlPoint = point;

            // instead of point position we need to calculate the position
            // on lane with distance value of road
            // lane and s value

            marking.mesh.position.setX( result.position.x );

            marking.mesh.position.setY( result.position.y );

            if ( lane.side === TvLaneSide.LEFT ) {

                pose.hdg += Maths.M_PI;

            }

            // calculation to set the orientation/heading of the marking
            const arrowHelper = new ArrowHelper( pose.toDirectionVector().normalize(), new Vector3( 0, 0, 0 ), 1, 1, 1, 1 );

            marking.mesh.setRotationFromQuaternion( arrowHelper.getWorldQuaternion( new Quaternion ) );

            this.map.gameObject.add( marking.mesh );

            this.sync( point, marking );

            road.pointMarkings.push( marking );

            // road.addRoadObjectInstance( roadObject );

        } else {

            this.shapeEditor.removeControlPoint( point );

            SnackBar.show( 'Please select a sign first' );

        }

    }

    private onControlPointSelected ( point: AnyControlPoint ) {

        console.log( point.mainObject );

    }

    private onConrolPointUpdated ( point: AnyControlPoint ) {

        if ( point.mainObject instanceof TvRoadMarking ) {

            this.currentMarking = point.mainObject;

            point.mainObject.mesh.position.setX( point.position.x );

            point.mainObject.mesh.position.setY( point.position.y );

        }

    }

    private sync ( point: AnyControlPoint, object: TvPointMarking ): void {

        const subscription = point.updated.subscribe( e => {

            object.mesh.position.setX( e.position.x );

            object.mesh.position.setY( e.position.y );

        } );

        this.cpSubscriptions.push( subscription );
    }

    private showPointMarkings () {

        this.map.roads.forEach( road => {

            road.pointMarkings.forEach( marking => {

                const cp = this.shapeEditor.addControlPoint( marking.mesh.position );

                this.sync( cp, marking );

            } );

        } );

    }

    private unsubscribeFromControlPoints () {

        this.cpSubscriptions.forEach( sub => {

            sub.unsubscribe();

        } );

    }

    private forEachRoadObject ( callback: ( object: TvRoadObject ) => void ) {

        // this.openDrive.roads.forEach( road => {

        //     road.objects.object.forEach( object => {

        //         if ( object.mesh ) callback( object );

        //     } );

        // } );

    }
}
