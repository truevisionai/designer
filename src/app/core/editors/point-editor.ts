/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { AbstractShapeEditor } from './abstract-shape-editor';

export class PointEditor extends AbstractShapeEditor {


    constructor ( private maxControlPoints: number = 1000 ) {

        super();

    }

    draw () {

        this.curveGeometryAdded.emit( null );

    }

    onPointerDown ( e: PointerEventData ) {

        if ( e.button == MouseButton.RIGHT ) return;

        this.pointerIsDown = true;

        this.pointerDownAt = e.point;

        if ( this.controlPoints.length >= this.maxControlPoints ) return;

        this.currentPoint = this.getNearestControlPoint( e );

        if ( this.currentPoint ) {

            this.currentPoint.select();

            this.controlPointSelected.emit( this.currentPoint );

        }

        if ( e.object != null && e.object.userData.is_selectable === true ) return;

        if ( e.button === MouseButton.LEFT && KeyboardInput.isShiftKeyDown && e.point != null ) {

            e.point.z = 0;

            this.addControlPoint( e.point );

            this.draw();
        }
    }

    onPointerMoved ( e: PointerEventData ): void {

        this.controlPoints.forEach( cp => cp.onMouseOut() );

        if ( e.point != null && this.pointerIsDown && this.controlPoints.length > 0 ) {

            this.isDragging = true;

            if ( this.currentPoint != null ) {

                e.point.z = 0;

                this.currentPoint.copyPosition( e.point );

                this.controlPointMoved.emit( this.currentPoint );

            }

        } else if ( e.point != null && !this.pointerIsDown && this.controlPoints.length > 0 ) {

            const controlPoint = this.getNearestControlPoint( e );

            if ( controlPoint ) {

                controlPoint.onMouseOver();

            }

        }

    }

    getNearestControlPoint ( e: PointerEventData ) {

        const maxDistance = Math.max( 0.5, e.approxCameraDistance * 0.01 );

        return PickingHelper.findNearest( e.point, this.controlPoints, maxDistance );
    }
}
