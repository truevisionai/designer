/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointDragHandler } from "../../../core/drag-handlers/point-drag-handler.service";
import { RoadControlPoint } from "../../../objects/road/road-control-point";
import { SplineGeometryService } from "../../../services/spline/spline-geometry.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Commands } from "../../../commands/commands";

@Injectable( {
	providedIn: 'root'
} )
export class RoadControlPointDragHandler extends PointDragHandler<RoadControlPoint> {

	constructor (
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	isDraggingSupported ( point: RoadControlPoint ): boolean {

		if ( point.spline.hasSuccessor() && point.index === 0 ) return false;

		if ( point.spline.hasPredecessor() && point.index === point.spline.getControlPoints().length - 1 ) return false;

		return true;

	}

	onDragStart ( point: RoadControlPoint, event: PointerEventData ): void {

		// do nothing

	}

	onDrag ( point: RoadControlPoint, event: PointerEventData ): void {

		point.setPosition( event.point );

		this.splineGeometryService.updateGeometryAndBounds( point.spline );

	}

	onDragEnd ( point: RoadControlPoint, event: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, event.point, this.dragStartPosition );

	}

}
