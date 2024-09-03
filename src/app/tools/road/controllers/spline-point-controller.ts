/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Commands } from "app/commands/commands";
import { PointController } from "app/core/controllers/point-controller";
import { AppInspector } from "app/core/inspector";
import { PointerEventData } from "app/events/pointer-event-data";
import { ToolManager } from "app/managers/tool-manager";
import { SplineControlPoint } from "app/objects/road/spline-control-point";
import { SplineGeometryService } from "app/services/spline/spline-geometry.service";
import { SplineService } from "app/services/spline/spline.service";
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

	}

	onDragEnd ( point: SplineControlPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, e.point, this.dragStartPosition );

	}

}
