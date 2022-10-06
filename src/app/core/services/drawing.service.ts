/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ThreeService } from 'app/modules/three-js/three.service';
import { COLOR } from 'app/shared/utils/colors.service';
import * as THREE from 'three';
import { Vector2 } from 'three';

@Injectable( {
    providedIn: 'root'
} )
export class DrawingService {

    ORANGE_COLOR = 0xFF4500;

    DEFAULT_BOX_COLOR = 0xff0000;
    HIGHTLIGHT_BOX_COLOR = 0x00ff00;
    CROSSHAIR_COLOR = 0x00ff00;
    DASHED_LINE_COLOR = 0xff00ff;

    lastBoundingBox: THREE.Object3D;
    lastSolidBox: THREE.Mesh;
    boxMaterial = new THREE.MeshBasicMaterial( { color: this.ORANGE_COLOR, opacity: 0.2, transparent: true } );
    lineDashedMaterial = new THREE.LineDashedMaterial( { color: this.DASHED_LINE_COLOR, linewidth: 10, dashSize: 3, gapSize: 3 } );

    boxes: Map<number, THREE.Mesh> = new Map<number, THREE.Mesh>();

    lastLine: THREE.Line;
    private lastButtonSprite: THREE.Sprite;
    private diskSprite = new THREE.TextureLoader().load( 'assets/disc.png' );

    constructor ( private engineService: ThreeService ) {

        // this.editor.undoAddedAnnotation.subscribe( e => this.engineService.remove( this.lastBoundingBox, true ) );

    }

    getLastSolidBox (): THREE.Mesh {
        return this.lastSolidBox;
    }

    getLastBoundingBox (): THREE.Object3D {
        return this.lastBoundingBox;
    }

    public drawSolidBox ( start: THREE.Vector3, end: THREE.Vector3, color: string = null ): THREE.Object3D {

        this.engineService.remove( this.lastBoundingBox, true );

        var box = this.getDimensions( start, end );

        var boxGeometry = new THREE.PlaneGeometry();

        var boxMaterial = ( new THREE.MeshBasicMaterial() ).copy( this.boxMaterial );

        boxMaterial.color.set( color ? color : '#000000' );

        this.lastSolidBox = new THREE.Mesh( boxGeometry, boxMaterial );

        this.lastSolidBox.geometry.scale( box.width, box.height, 1 );

        if ( end.y < start.y ) box.height *= -1;
        if ( end.x < start.x ) box.width *= -1;

        this.lastSolidBox.position.set( start.x + ( box.width / 2 ), start.y + ( box.height / 2 ), 0.1 );

        this.engineService.add( this.lastSolidBox, true );

        this.addBoxInfo( this.lastSolidBox, start, end, box );

        // this.updateControlPoints( start, end, this.lastBox );

        this.drawBoundingBox( start, end );

        this.drawDeletButton( start.x, start.y, this.lastSolidBox );

        return this.lastSolidBox;
    }

    public drawBoundingBox ( start: THREE.Vector3, end: THREE.Vector3, color: string = null ): THREE.Object3D {

        var box = this.getDimensions( start, end );

        var geometry = new THREE.PlaneGeometry( box.width, box.height );
        var edges = new THREE.EdgesGeometry( geometry );
        var material = new THREE.LineBasicMaterial( { color: color ? color : 0xff00ff } );

        this.lastBoundingBox = new THREE.LineSegments( edges, material );

        // this.lastBoundingBox.computeLineDistances();

        geometry.scale( box.width, box.height, 1 );

        if ( end.y < start.y ) box.height *= -1;
        if ( end.x < start.x ) box.width *= -1;

        // this.lastBoundingBox.position.set( start.x + ( box.width / 2 ), start.y + ( box.height / 2 ), 0.1 );

        this.lastSolidBox.add( this.lastBoundingBox );

        // this.engineService.add( this.lastBoundingBox, true );

        this.addBoxInfo( this.lastBoundingBox, start, end, box );

        return this.lastBoundingBox;
    }

    public drawLine ( vertices: Vector2[] ) {

        this.engineService.remove( this.lastLine, true );

        let material = new THREE.LineBasicMaterial( { color: 0xFF0000 } );

        var geometry = new THREE.Geometry();

        for ( let i = 0; i < vertices.length; i++ ) {

            const item = vertices[ i ];

            const position = new THREE.Vector3( item.x, item.y, 0.2 );

            geometry.vertices.push( position );
        }

        this.lastLine = new THREE.Line( geometry, material );

        for ( let i = 0; i < vertices.length; i++ ) {

            const item = vertices[ i ];

            const position = new THREE.Vector3( item.x, item.y, 0.2 );

            this.drawSpritePoint( position, this.lastLine );
        }

        this.engineService.add( this.lastLine, true );
    }

    public drawDeletButton ( x, y, parent ) {

        // this.engineService.remove( this.lastButtonSprite, true );

        // var button = new DeleteButton( x, y, parent );

        // this.engineService.add( button.object, true );

        // this.lastButtonSprite = button.object;
    }

    drawSpritePoint ( position: any, parent: any ) {

        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push( new THREE.Vector3( 0, 0, 0 ) );

        var dotMaterial = new THREE.PointsMaterial( {
            size: 15,
            sizeAttenuation: true,
            map: this.diskSprite,
            alphaTest: 0.5,
            transparent: true,
            color: COLOR.MAGENTA
        } );

        // dotMaterial.color.setHSL( 1.0, 0.3, 0.7 );

        var object = new THREE.Points( dotGeometry, dotMaterial );

        object.position.set( position.x, position.y, position.z );

        // this.engineService.add( object );
        this.lastLine.add( object );

        // extra data
        object.userData.is_button = true;
        object.userData.is_control_point = true;

        return object;

    }

    drawPoint ( position: any, parent: any ): any {

        var geometry = new THREE.CircleBufferGeometry( 5, 32 );
        var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x00FF00 } ) );

        object.position.set( position.x, position.y, position.z + 0.2 );

        // this.engineService.add( object );
        this.lastLine.add( object );

        // extra data
        object.userData.is_button = true;
        object.userData.is_control_point = true;

        return object;
    }

    private addBoxInfo ( object: THREE.Object3D, start: THREE.Vector3, end: THREE.Vector3, box: any ): any {

        object.userData.is_annotation = true;
        object.userData.type = 'box';

        object.userData.width = box.width;
        object.userData.height = box.height;

        object.userData.startX = start.x;
        object.userData.startY = start.y;

        object.userData.endX = end.x;
        object.userData.endY = end.y;
    }

    private getDimensions ( p1, p2 ): any {

        let width = Math.abs( p1.x - p2.x );
        let height = Math.abs( p1.y - p2.y );

        width = Math.max( width, 10 );
        height = Math.max( height, 10 );

        return {
            width: width,
            height: height
        };
    }

}
