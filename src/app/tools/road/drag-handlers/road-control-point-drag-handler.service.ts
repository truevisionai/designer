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

	onDragStart ( object: RoadControlPoint, e: PointerEventData ): void {

		// throw new Error( "Method not implemented." );

	}

	onDrag ( point: RoadControlPoint, e: PointerEventData ): void {

		point.setPosition( e.point );

		this.splineGeometryService.updateGeometryAndBounds( point.spline );

	}

	onDragEnd ( point: RoadControlPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, e.point, this.dragStartPosition );

	}

}