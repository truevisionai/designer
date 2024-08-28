/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { SplineControlPoint } from "../../objects/spline-control-point";
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
export class SplineControlPointHandler extends BasePointHandler<SplineControlPoint> {

	constructor (
		private splineService: SplineService,
		private roadLinkService: RoadLinkService,
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	onAdded ( point: SplineControlPoint ): void {

		this.splineService.addOrInsertPoint( point.spline, point );

	}

	onUpdated ( point: SplineControlPoint ): void {

		this.splineService.updateControlPoint( point );

		this.roadLinkService.updateSplineLinks( point.spline, point );

		this.splineService.updateSpline( point.spline );

	}

	onRemoved ( point: SplineControlPoint ): void {

		this.splineService.removePoint( point.spline, point );

		this.splineService.updateSpline( point.spline );

	}

	onDrag ( point: SplineControlPoint, e: PointerEventData ): void {

		point.setPosition( e.point );

		this.splineGeometryService.updateGeometryAndBounds( point.spline );

		ToolManager.getTool().onUpdateOverlay( point.spline );

	}

	onDragEnd ( point: SplineControlPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, e.point, this.dragStartPosition );

	}

}
