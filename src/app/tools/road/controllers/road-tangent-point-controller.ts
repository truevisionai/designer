/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { RoadTangentPoint } from "../../../objects/road/road-tangent-point";
import { SplineService } from "../../../services/spline/spline.service";
import { RoadLinkService } from "../../../services/road/road-link.service";
import { SplineGeometryService } from "../../../services/spline/spline-geometry.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { Commands } from "../../../commands/commands";
import { PointController } from "../../../core/controllers/point-controller";
import { RoadInspector } from "app/views/inspectors/road-inspector/road-inspector.component";
import { AppInspector } from "../../../core/inspector";

@Injectable( {
	providedIn: 'root'
} )
export class RoadTangentPointController extends PointController<RoadTangentPoint> {

	constructor (
		private splineService: SplineService,
		private roadLinkService: RoadLinkService,
		private splineGeometryService: SplineGeometryService,
	) {
		super();
	}

	showInspector ( object: RoadTangentPoint ): void {

		AppInspector.setInspector( RoadInspector, { spline: object.spline, controlPoint: object } );

	}

	onAdded ( object: RoadTangentPoint ): void { }

	onRemoved ( object: RoadTangentPoint ): void { }

	onUpdated ( point: RoadTangentPoint ): void {

		this.splineService.updateControlPoint( point );

		this.splineService.updateSpline( point.spline );

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
