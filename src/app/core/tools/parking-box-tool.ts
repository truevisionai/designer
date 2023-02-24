/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AddRoadObjectCommand } from 'app/core/commands/add-road-object-command';
import { PointerEventData } from 'app/events/pointer-event-data';
import { TvOrientation } from 'app/modules/tv-map/models/tv-common';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoadObject } from 'app/modules/tv-map/models/tv-road-object';
import { CommandHistory } from 'app/services/command-history';
import { RoadObjectInspectorComponent } from 'app/views/inspectors/road-object-inspector/road-object-inspector.component';
import { Subscription } from 'rxjs';
import { Object3D } from 'three';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { BoxCreatedEvent, BoxEditor } from '../editors/box-editor';
import { BaseTool } from './base-tool';

export abstract class BaseParkingTool extends BaseTool {

}

export class ParkingBoxTool extends BaseParkingTool {

    name = 'ParkingBoxTool';
    shapeEditor: BoxEditor;
    boxCreatedSub: Subscription;
    selectedBox: Object3D;
    selectedObject: TvRoadObject;
    objects: TvRoadObject[] = [];

    init () {

        super.init();

        this.shapeEditor = new BoxEditor();

    }

    enable () {

        super.enable();

        this.boxCreatedSub = this.shapeEditor.boxCreated.subscribe( e => this.onBoxCreated( e ) );

    }

    disable (): void {

        super.disable();

        this.boxCreatedSub.unsubscribe();

        this.shapeEditor.destroy();
    }

    onBoxCreated ( e: BoxCreatedEvent ) {

        const position = e.mesh.position;

        const theta = new TvPosTheta();

        const road = TvMapQueries.getRoadByCoords( position.x, position.y, theta );

        const type = 'parkingSpace';
        const name = '';
        const id = 1;
        const s = theta.s;
        const t = theta.t;
        const z = 0;
        const validLength = 0.0;
        const orientation = TvOrientation.NONE;
        const length = e.length;
        const width = e.width;
        const height = e.height;
        const radius = null;
        const hdg = 0;
        const pitch = 0;
        const roll = 0;

        const object = new TvRoadObject(
            type, name, id, s, t, z, validLength, orientation, length, width, radius, height, hdg, pitch, roll
        );

        object.mesh = e.mesh;

        this.objects.push( object );

        CommandHistory.execute( new AddRoadObjectCommand( road.id, object ) );

    }

    onPointerClicked ( e: PointerEventData ) {

        let found = false;

        for ( const intersection of e.intersections ) {

            for ( const object of this.objects ) {

                if ( object.mesh.id === intersection.object.id ) {

                    this.selectedBox = intersection.object;

                    this.selectedObject = object;

                    // AppService.three.select( i.object );

                    found = true;

                    // this.shapeEditor.disable();

                    this.setInspector( RoadObjectInspectorComponent, object );

                    break;
                }

            }

        }

        if ( !found ) {

            this.selectedBox = null;

            this.selectedObject = null;

            this.clearInspector();

            // AppService.three.deselect();

            // this.shapeEditor.enable();
        }


    }

}
