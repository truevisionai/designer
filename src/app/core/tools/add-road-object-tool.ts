/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { BaseTool } from './base-tool';
import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Object3D, TextureLoader } from 'three';
import { AbstractShapeEditor } from '../editors/abstract-shape-editor';
import { Subscription } from 'rxjs';
import { PointEditor } from '../editors/point-editor';
import { AddRoadObjectCommand } from '../commands/add-road-object-command';
import { TvOrientation } from '../../modules/tv-map/models/tv-common';
import { TvRoadObject } from '../../modules/tv-map/models/tv-road-object';
import { CommandHistory } from '../../services/command-history';
import { AnyControlPoint } from '../../modules/three-js/objects/control-point';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';

export class AddRoadObjectTool extends BaseTool {

    name: string = 'RoadObject';

    private roadObjects: Object3D[] = [];
    private shapeEditor: AbstractShapeEditor;
    private treeTexture = new TextureLoader().load( 'assets/top-down-tree.png' );
    private subsribers: Subscription[] = [];

    constructor ( private propSprite: string = 'assets/top-down-tree.png' ) {

        super();

        this.shapeEditor = new PointEditor();

    }

    init () {

        super.init();

        this.populate();

        const s1 = this.shapeEditor.controlPointAdded.subscribe( e => this.onPointAdded( e ) );
        const s2 = this.shapeEditor.controlPointMoved.subscribe( e => this.onPointMoved( e ) );

        this.subsribers.push( s1 );
        this.subsribers.push( s2 );
    }

    populate () {

        this.map.roads.forEach( road => {

            const objects = road.getRoadObjects();

            for ( let i = 0; i < objects.length; i++ ) {

                this.roadObjects.push( objects[ i ].mesh );

                const point = this.shapeEditor.addControlPoint( objects[ i ].mesh.position );

                objects[ i ].mesh.userData.controlPointId = point.id;
            }

        } );

    }

    disable (): void {

        super.disable();

        this.shapeEditor.destroy();

        this.subsribers.forEach( item => {
            item.unsubscribe();
        } );
    }

    private onPointAdded ( e: AnyControlPoint ) {

        this.addProp( e );

    }

    private onPointMoved ( e: AnyControlPoint ) {

        for ( const prop of this.roadObjects ) {

            if ( prop.userData.controlPointId === e.id ) {

                prop.position.set( e.position.x, e.position.y, prop.position.z );

                break;

            }

        }

    }

    private getMaterial () {

        return new MeshBasicMaterial( {
            map: this.treeTexture,
            transparent: true,
            opacity: 0.9
        } );

    }

    private addProp ( point: Object3D ) {

        const road = TvMapQueries.getRoadByCoords( point.position.x, point.position.y );

        if ( !road ) throw new Error( 'Need road to place objects' );

        const material = this.getMaterial();

        const geometry = new BoxBufferGeometry( 1, 1, 1 );

        const obj = new Mesh( geometry, material );

        obj.position.copy( point.position );

        obj.userData.controlPointId = point.id;

        this.roadObjects.push( obj );

        // tslint:disable-next-line:max-line-length
        // const roadObject = this.ma.getRoad( 0 ).addRoadObject( 'tree', 'tree', point.id, 0, 0, 0, 0, OdOrientations.NONE, null, null, null, null, null, null, null );

        const roadObject = new TvRoadObject( 'tree', 'tree', point.id, 0, 0, 0, 0, TvOrientation.NONE );

        roadObject.mesh = obj;

        CommandHistory.execute( new AddRoadObjectCommand( road.id, roadObject, [ point ] ) );
    }

}
