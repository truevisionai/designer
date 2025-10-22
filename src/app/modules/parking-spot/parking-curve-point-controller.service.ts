/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointController } from "../../core/controllers/point-controller";
import { SplineService } from "../../services/spline/spline.service";
import { ParkingCurveInspector } from "./parking-curve.inspector";
import { ParkingNodeInspector } from "./parking-node-inspector";
import { ParkingCurvePoint } from "./objects/parking-curve-point";
import { MapService } from "app/services/map/map.service";
import { PointVisualizer } from "app/tools/maneuver/point-visualizer";
import { ParkingNodePoint } from "./objects/parking-node-point";
import { ToolManager } from "app/managers/tool-manager";

@Injectable()
export class ParkingCurvePointController extends PointController<ParkingCurvePoint> {

	constructor ( private splineService: SplineService ) {
		super();
	}

	onAdded ( point: ParkingCurvePoint ): void {

		point.mainObject.getSpline().addControlPoint( point );

		point.mainObject.update();

	}

	onUpdated ( point: ParkingCurvePoint ): void {

		point.mainObject.update();

	}

	onRemoved ( point: ParkingCurvePoint ): void {

		point.mainObject.getSpline().removeControlPoint( point );

		point.mainObject.update();

	}

	showInspector ( point: ParkingCurvePoint ): void {

		this.setInspector( new ParkingCurveInspector( point.mainObject, point ) );

	}

}

@Injectable()
export class ParkingNodeController extends PointController<ParkingNodePoint> {

	constructor ( private mapService: MapService ) {
		super();
	}

	onAdded ( point: ParkingNodePoint ): void {

		// point.mainObject.getSpline().addControlPoint( point );

		// point.mainObject.update();

	}

	onUpdated ( point: ParkingNodePoint ): void {

		// point.mainObject.update();
		point.mainObject.position.copy( point.position );

	}

	onRemoved ( point: ParkingNodePoint ): void {

		// point.mainObject.getSpline().removeControlPoint( point );

		// point.mainObject.update();

	}

	showInspector ( point: ParkingNodePoint ): void {

		this.setInspector( new ParkingNodeInspector( point.mainObject, this.mapService.map.getParkingGraph() ) );

	}

}


@Injectable()
export class ParkingNodeVisualizer extends PointVisualizer<ParkingNodePoint> {

	protected override updateSpline ( object: ParkingNodePoint ): void {

		// NOTE: hack to update parking graph
		ToolManager.onObjectUpdated( object.mainObject );

	}

}

