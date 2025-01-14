/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDragHandler } from "../../../core/drag-handlers/base-drag-handler";
import { RoadTangentPoint } from "../../../objects/road/road-tangent-point";
import { SplineGeometryService } from "../../../services/spline/spline-geometry.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Commands } from "../../../commands/commands";
import { Vector3 } from "app/core/maths"

@Injectable( {
	providedIn: 'root'
} )
export class RoadTangentPointDragHandler extends BaseDragHandler<RoadTangentPoint> {

	private oldPosition: Vector3;

	constructor (
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	onDragStart ( point: RoadTangentPoint, e: PointerEventData ): void {

		this.oldPosition = point.position.clone();

	}

	onDrag ( point: RoadTangentPoint, e: PointerEventData ): void {

		this.oldPosition = this.oldPosition || point.position.clone();

		point.setPosition( e.point );

		point.update();

		point.controlPoint.update();

		this.splineGeometryService.updateGeometryAndBounds( point.getSpline() );

	}

	onDragEnd ( point: RoadTangentPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.getSpline(), point, e.point, this.oldPosition );

		this.oldPosition = null;

	}

}
