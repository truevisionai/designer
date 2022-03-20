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
import { Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, TextureLoader } from 'three';
import { OdSignalInspectorComponent } from 'app/views/inspectors/signal-inspector/signal-inspector.component';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvOrientation } from 'app/modules/tv-map/models/tv-common';
import { SnackBar } from 'app/services/snack-bar.service';
import { MarkingTypes, TvMarkingService, TvRoadMarking } from 'app/modules/tv-map/services/tv-marking.service';
import { TvRoadObject } from 'app/modules/tv-map/models/tv-road-object';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';

export abstract class BaseMarkingTool extends BaseTool {

}

export class MarkingPointTool extends BaseMarkingTool {

    name: string = 'MarkingPointTool';

    private shapeEditor: AbstractShapeEditor;
    private hasSignal = false;
    private selectedSignal: TvRoadSignal;
    private cpSubscriptions: Subscription[] = [];

    private controlPointAddedSubscriber: Subscription;
    private controlPointSelectedSubscriber: Subscription;

    private currentMarking: TvRoadMarking;

    constructor () {

        super();

    }

    init () {

        super.init();

        this.shapeEditor = new PointEditor();

        this.createControlPoints();

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

    get marking () {

        return TvMarkingService.currentMarking;

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

    private onControlPointAdded ( point: AnyControlPoint ) {

        if ( !this.marking ) SnackBar.error( "Select a marking from project browser" );

        if ( !this.marking ) return;

        const pose = new TvPosTheta();

        pose.x = point.position.x;

        pose.y = point.position.y;

        const road = TvMapQueries.getRoadByCoords( pose.x, pose.y, pose );

        if ( !road ) SnackBar.error( "Marking can be added only on road mesh" );

        if ( !road ) this.shapeEditor.removeControlPoint( point );

        if ( !road ) return;

        if ( this.marking && this.marking.type === MarkingTypes.point ) {

            // const id = road.getRoadObjectCount() + 1;

            // const marking = this.marking.name;

            // const texture = new TextureLoader().load( `assets/markings/${ marking }.png` );

            // const material = new MeshBasicMaterial( { map: texture, alphaTest: 0.1 } );

            // const geometry = new PlaneBufferGeometry( 1, 1 );

            // const mesh = new Mesh( geometry, material );

            const marking = point.mainObject = this.marking.clone();

            marking.mesh.position.setX( point.position.x );

            marking.mesh.position.setY( point.position.y );

            this.map.gameObject.add( marking.mesh );

            // const roadObject = new TvRoadObject( 'marking', 'arrow-forward', id, pose.s, pose.t, 0, 0, TvOrientation.MINUS );

            // roadObject.mesh = mesh;

            this.sync( point, marking );

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

    private sync ( point: AnyControlPoint, object: TvRoadMarking ): void {

        // const subscription = point.updated.subscribe( e => {

        //     object.mesh.position.setX( e.position.x );

        //     object.mesh.position.setY( e.position.y );

        // } );

        // this.cpSubscriptions.push( subscription );
    }

    private createControlPoints () {

        // this.forEachRoadObject( object => {

        //     const cp = this.shapeEditor.addControlPoint( object.mesh.position );

        //     this.sync( cp, object );

        // } );

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
