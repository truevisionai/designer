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
import { PointController } from "./point-controller";
import { RoadInspector } from "app/views/inspectors/road-inspector/road-inspector.component";
import { AppInspector } from "../inspector";

@Injectable( {
	providedIn: 'root'
} )
export class RoadControlPointController extends PointController<RoadControlPoint> {

	constructor (
		private splineService: SplineService,
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	showInspector ( object: RoadControlPoint ): void {

		AppInspector.setInspector( RoadInspector, { spline: object.spline, controlPoint: object } );

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

		point.setPosition( e.point );

		this.splineGeometryService.updateGeometryAndBounds( point.spline );

		ToolManager.getTool().updateVisuals( point.spline );

	}

	onDragEnd ( point: RoadControlPoint, e: PointerEventData ): void {

		Commands.SetPointPosition( point.spline, point, e.point, this.dragStartPosition );

	}

}
