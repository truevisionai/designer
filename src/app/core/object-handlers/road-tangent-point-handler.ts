/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { RoadTangentPoint } from "../../objects/road-tangent-point";
import { SplineService } from "../../services/spline/spline.service";
import { RoadLinkService } from "../../services/road/road-link.service";
import { SplineGeometryService } from "../../services/spline/spline-geometry.service";
import { PointerEventData } from "../../events/pointer-event-data";
import { ToolManager } from "../../managers/tool-manager";
import { Commands } from "../../commands/commands";
import { BasePointHandler } from "./base-point-handler";

@Injectable( {
	providedIn: 'root'
} )
export class RoadTangentPointHandler extends BasePointHandler<RoadTangentPoint> {

	constructor (
		private splineService: SplineService,
		private roadLinkService: RoadLinkService,
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	onUpdated ( point: RoadTangentPoint ): void {

		this.splineService.updateControlPoint( point );

		this.splineService.updateSpline( point.spline );

	}

	onDrag ( point: RoadTangentPoint, e: PointerEventData ): void {

		point.setPosition( e.point );

		point.update();

		point.controlPoint.update();

		this.splineGeometryService.updateGeometryAndBounds( point.spline );

		ToolManager.getTool().onUpdateOverlay( point.spline );

	}

	onDragEnd ( point: RoadTangentPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, e.point, this.dragStartPosition );

	}

}
