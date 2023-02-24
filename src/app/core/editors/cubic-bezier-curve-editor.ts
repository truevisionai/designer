/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import * as THREE from 'three';
import { Curve, Object3D } from 'three';
import { MouseButton, PointerEventData, PointerMoveData } from '../../events/pointer-event-data';
import { AnyControlPoint } from '../../modules/three-js/objects/control-point';
import { KeyboardInput } from '../input';
import { SceneService } from '../services/scene.service';
import { AbstractShapeEditor } from './abstract-shape-editor';

export class CubicBezierCurveEditor extends AbstractShapeEditor {

    private curve: Curve<any>;
    private referenceLine: Object3D;
    private v0: AnyControlPoint;
    private v1: AnyControlPoint;
    private v2: AnyControlPoint;
    private v3: AnyControlPoint;

    constructor () {

        super();

    }

    public draw () {
        this.drawCurve();
    }

    onPointerMoved ( e: PointerMoveData ): void {

        if ( e.point != null && this.pointerIsDown && this.controlPoints.length > 1 ) {

            this.isDragging = true;

            if ( this.currentPoint != null ) this.currentPoint.copyPosition( e.point );

            // this.lastControlPoint.position.copy( e.point );

            if ( this.controlPoints.length > 1 ) this.drawCurve();

        }

    }

    onPointerDown ( e: PointerEventData ) {

        this.pointerIsDown = true;

        this.pointerDownAt = e.point;

        if ( this.controlPoints.length >= 4 ) return;

        if ( e.object != null && e.object.userData.is_selectable == true ) return;

        if ( e.button == MouseButton.LEFT && KeyboardInput.isShiftKeyDown && e.point != null ) {

            this.addControlPoint( e.point );

            if ( this.controlPoints.length > 1 ) this.draw();
        }
    }

    drawCurve () {

        if ( this.referenceLine != null ) SceneService.remove( this.referenceLine, false );

        this.updateBezierPoints();

        this.curve = new THREE.CubicBezierCurve3( this.v0.position, this.v1.position, this.v2.position, this.v3.position );

        let points = this.curve.getPoints( 50 );

        let geometry = new THREE.BufferGeometry().setFromPoints( points );

        let material = new THREE.LineBasicMaterial( { color: 0xff0000 } );

        // Create the final object to add to the scene
        this.referenceLine = new THREE.Line( geometry, material );

        SceneService.add( this.referenceLine, false );

        if ( this.controlPoints.length == 2 ) {

            this.curveGeometryAdded.emit( this.curve );

        } else if ( this.controlPoints.length > 2 ) {

            this.curveGeometryChanged.emit( this.curve );

        }
    }

    private updateBezierPoints () {

        if ( this.controlPoints.length == 2 ) {

            this.v0 = this.controlPoints[ 0 ];
            this.v1 = this.controlPoints[ 0 ];
            this.v2 = this.controlPoints[ 1 ];
            this.v3 = this.controlPoints[ 1 ];

        } else if ( this.controlPoints.length == 3 ) {

            this.v0 = this.controlPoints[ 0 ];
            this.v1 = this.controlPoints[ 0 ];
            this.v2 = this.controlPoints[ 1 ];
            this.v3 = this.controlPoints[ 2 ];

        } else if ( this.controlPoints.length == 4 ) {

            this.v0 = this.controlPoints[ 0 ];
            this.v1 = this.controlPoints[ 1 ];
            this.v2 = this.controlPoints[ 2 ];
            this.v3 = this.controlPoints[ 3 ];

        }
    }
}
