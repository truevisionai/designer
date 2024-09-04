/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDragHandler } from "../../../core/drag-handlers/base-drag-handler";
import { RoadTangentPoint } from "../../../objects/road/road-tangent-point";
import { SplineGeometryService } from "../../../services/spline/spline-geometry.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Commands } from "../../../commands/commands";

@Injectable( {
	providedIn: 'root'
} )
export class RoadTangentPointDragHandler extends BaseDragHandler<RoadTangentPoint> {

	constructor (
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	onDragStart ( object: RoadTangentPoint, e: PointerEventData ): void {

		// throw new Error( "Method not implemented." );

	}

	onDrag ( point: RoadTangentPoint, e: PointerEventData ): void {

		point.setPosition( e.point );

		point.update();

		point.controlPoint.update();

		this.splineGeometryService.updateGeometryAndBounds( point.spline );

	}

	onDragEnd ( point: RoadTangentPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, e.point, this.dragStartPosition );

	}

}