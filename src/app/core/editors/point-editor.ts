/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Raycaster } from 'three';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { AbstractShapeEditor } from './abstract-shape-editor';
import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';

export class PointEditor extends AbstractShapeEditor {

	constructor ( private maxControlPoints: number = 1000, public precision = 0.5 ) {

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

		this.currentPoint = this.findNearestViaRaycasting( e );

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

			const controlPoint = this.findNearestViaRaycasting( e );

			if ( controlPoint ) {

				controlPoint.onMouseOver();

			}

		}

	}

	findNearestViaDistance ( e: PointerEventData ) {

		// Calculate the maxDistance using an exponential function based on approxCameraDistance
		const scaleFactor = 0.001; // Adjust this value to change the sensitivity

		const maxDistance = Math.max( this.precision, Math.exp( scaleFactor * e.approxCameraDistance ) );

		return PickingHelper.findNearestViaDistance( e.point, this.controlPoints, maxDistance );

	}

	findNearestViaRaycasting ( e: PointerEventData ) {

		return PickingHelper.findNearestViaRaycasting( e, this.controlPoints );

	}
}
