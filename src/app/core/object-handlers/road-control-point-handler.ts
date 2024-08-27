/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { RoadControlPoint } from "../../objects/road-control-point";
import { SplineService } from "../../services/spline/spline.service";
import { SplineGeometryService } from "../../services/spline/spline-geometry.service";
import { PointerEventData } from "../../events/pointer-event-data";
import { ToolManager } from "../../managers/tool-manager";
import { Commands } from "../../commands/commands";
import { BasePointHandler } from "./base-point-handler";

@Injectable( {
	providedIn: 'root'
} )
export class RoadControlPointHandler extends BasePointHandler<RoadControlPoint> {

	constructor (
		private splineService: SplineService,
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	onAdded ( point: RoadControlPoint ): void {

		this.splineService.addOrInsertPoint( point.spline, point );

	}

	onUpdated ( point: RoadControlPoint ): void {

		this.splineService.updateControlPoint( point );

		this.splineService.updateSpline( point.spline );

	}

	onRemoved ( point: RoadControlPoint ): void {

		this.splineService.removePoint( point.road.spline, point );

		this.splineService.updateSpline( point.spline );

	}

	onDrag ( point: RoadControlPoint, e: PointerEventData ): void {

		this.oldPosition = this.oldPosition || e.point;

		point.setPosition( e.point );

		this.splineGeometryService.updateGeometryAndBounds( point.spline );

		ToolManager.getTool().onUpdateOverlay( point.spline );

	}

	onDragEnd ( point: RoadControlPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, e.point, this.oldPosition );

		this.oldPosition = null;

	}

}
