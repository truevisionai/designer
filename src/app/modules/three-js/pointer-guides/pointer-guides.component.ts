/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Component, OnInit } from '@angular/core';
import { AppService } from 'app/core/services/app.service';
import { PointerMoveData } from 'app/events/pointer-event-data';
import { ThreeService } from 'app/modules/three-js/three.service';
import * as THREE from 'three';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';

@Component( {
    selector: 'app-pointer-guides',
    templateUrl: './pointer-guides.component.html'
} )
export class PointerGuidesComponent implements OnInit {

    draw: boolean = false;

    private CROSSHAIR_COLOR = 0x000000;

    private lineMaterial = new THREE.LineBasicMaterial( {
        color: this.CROSSHAIR_COLOR,
        linewidth: 10,
    } );

    private lineGeometry = new THREE.BufferGeometry();
    private verticalLine = new THREE.Line( this.lineGeometry, this.lineMaterial );
    private horizontalLine = new THREE.Line( this.lineGeometry, this.lineMaterial );

    constructor (
        private engineService: ThreeService,
    ) {
    }

    ngOnInit () {

        if ( this.draw ) {

            AppService.eventSystem.pointerMoved.subscribe( e => this.onPointerMoved( e ) );

        }

    }

    onPointerMoved ( e: PointerMoveData ): any {

        this.updateLineHelpers( e );

    }

    updateLineHelpers ( data: PointerMoveData ): void {

        this.updateCursorType();

        this.engineService.remove( this.verticalLine );
        this.engineService.remove( this.horizontalLine );

        // DRAW IF CURSOR IS ON IMAGE
        if ( data ) {

            const point = data.point;

            // TODO: UPDATE FIX
            // var geometry = new LineGeometry();
            // geometry.vertices.push( new THREE.Vector3( point.x, -10000, 1 ) );
            // geometry.vertices.push( new THREE.Vector3( point.x, 10000, 1 ) );
            // this.horizontalLine = new THREE.Line( geometry, this.lineMaterial );
            // this.horizontalLine.computeLineDistances();
            //
            // // TODO: UPDATE FIX
            // var geometry = new LineGeometry();
            // geometry.vertices.push( new THREE.Vector3( -10000, point.y, 1 ) );
            // geometry.vertices.push( new THREE.Vector3( 10000, point.y, 1 ) );

            // this.verticalLine = new THREE.Line( geometry, this.lineMaterial );
            // this.verticalLine.computeLineDistances();

            // this.engineService.add( this.verticalLine );
            // this.engineService.add( this.horizontalLine );

        }

    }

    updateCursorType (): any {

        // this.engineService.canvas.style.cursor = 'crosshair';

        // if ( this.inputService.isShiftKeyDown ) {
        //   // this.engineService.canvas.style.cursor = 'grab';
        // } else if ( this.engineService.cursorOnBox && !this.drawing ) {
        //   this.engineService.canvas.style.cursor = 'move';
        // } else {
        //   this.engineService.canvas.style.cursor = 'crosshair';
        // }

    }

}
