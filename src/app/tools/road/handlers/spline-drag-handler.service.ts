/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDragHandler } from "../../../core/drag-handlers/base-drag-handler";
import { AutoSpline } from "../../../core/shapes/auto-spline-v2";
import { SplineGeometryService } from "../../../services/spline/spline-geometry.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { SplineUtils } from "../../../utils/spline.utils";
import { Commands } from "../../../commands/commands";
import { Vector3 } from "app/core/maths"

@Injectable( {
	providedIn: 'root'
} )
export abstract class SplineDragHandler extends BaseDragHandler<AutoSpline> {

	private oldPositions: Vector3[];

	constructor (
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	onDragStart ( object: AutoSpline, e: PointerEventData ): void {

		this.oldPositions = object.getControlPoints().map( point => point.position.clone() );

	}

	onDrag ( object: AutoSpline, e: PointerEventData ): void {

		if ( object.isLinkedToJunction() ) {
			this.setHint( 'Moving spline connected with junction is not supported. Add control points to modify spline.' );
			return;
		}

		object.getControlPoints().forEach( point => {

			point.position.add( this.dragDelta );

		} );

		this.splineGeometryService.updateGeometryAndBounds( object );

	}

	onDragEnd ( object: AutoSpline, e: PointerEventData ): void {

		if ( this.dragStartPosition.equals( this.dragEndPosition ) ) {
			return;
		}

		// minimum distance to consider as drag
		if ( this.dragStartPosition.distanceTo( this.dragEndPosition ) < 0.0001 ) {
			return;
		}

		const newPositions = object.getControlPoints().map( point => point.position.clone() );

		Commands.DragSpline( object, newPositions, this.oldPositions );

		this.oldPositions = [];
	}

}
