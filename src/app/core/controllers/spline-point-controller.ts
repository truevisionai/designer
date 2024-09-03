/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { SplineControlPoint } from "../../objects/road/spline-control-point";
import { SplineService } from "../../services/spline/spline.service";
import { SplineGeometryService } from "../../services/spline/spline-geometry.service";
import { PointerEventData } from "../../events/pointer-event-data";
import { ToolManager } from "../../managers/tool-manager";
import { Commands } from "../../commands/commands";
import { PointController } from "./point-controller";
import { AppInspector } from "../inspector";
import { RoadInspector } from "app/views/inspectors/road-inspector/road-inspector.component";

@Injectable( {
	providedIn: 'root'
} )
export class SplinePointController extends PointController<SplineControlPoint> {

	constructor (
		private splineService: SplineService,
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	showInspector ( object: SplineControlPoint ): void {

		AppInspector.setInspector( RoadInspector, { spline: object.spline, controlPoint: object } );

	}

	onAdded ( point: SplineControlPoint ): void {

		this.splineService.addOrInsertPoint( point.spline, point );

	}

	onUpdated ( point: SplineControlPoint ): void {

		this.splineService.updateControlPoint( point );

		this.splineService.updateSpline( point.spline );

	}

	onRemoved ( point: SplineControlPoint ): void {

		this.splineService.removePoint( point.spline, point );

		this.splineService.updateSpline( point.spline );

	}

	onDrag ( point: SplineControlPoint, e: PointerEventData ): void {

		point.setPosition( e.point );

		this.splineGeometryService.updateGeometryAndBounds( point.spline );

		ToolManager.getTool().updateVisuals( point.spline );

	}

	onDragEnd ( point: SplineControlPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, e.point, this.dragStartPosition );

	}

}
