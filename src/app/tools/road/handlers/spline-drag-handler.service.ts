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

@Injectable( {
	providedIn: 'root'
} )
export abstract class SplineDragHandler extends BaseDragHandler<AutoSpline> {

	constructor (
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	onDragStart ( object: AutoSpline, e: PointerEventData ): void {

		//

	}

	onDrag ( object: AutoSpline, e: PointerEventData ): void {

		if ( SplineUtils.isConnectedToJunction( object ) ) {
			this.setHint( 'Moving spline connected with junction is not supported. Add control points to modify spline.' );
			return;
		}

		object.getControlPoints().forEach( point => {

			point.position.add( this.dragDelta );

		} );

		this.splineGeometryService.updateGeometryAndBounds( object );

	}

	onDragEnd ( object: AutoSpline, e: PointerEventData ): void {

		const delta = this.dragStartPosition.clone().sub( this.dragEndPosition );

		Commands.DragSpline( object, delta );

	}

}
