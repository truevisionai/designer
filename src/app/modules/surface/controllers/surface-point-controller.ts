/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointController } from "app/core/controllers/point-controller";
import { SurfaceService } from "app/map/surface/surface.service";
import { SplineService } from "app/services/spline/spline.service";
import { Surface } from "app/map/surface/surface.model";
import { SimpleControlPoint } from "app/objects/simple-control-point";
import { TvSurfaceInspector } from "../inspectors/surface.inspector";

@Injectable()
export class SurfaceControlPointController extends PointController<SimpleControlPoint<Surface>> {

	constructor ( private surfaceService: SurfaceService, private splineService: SplineService ) {
		super();
	}

	onAdded ( point: SimpleControlPoint<Surface> ): void {

		const index = this.splineService.findIndex( point.mainObject.spline, point.position );

		point.mainObject.spline.controlPoints.splice( index, 0, point );

		this.splineService.updatePointHeading( point.mainObject.spline, point, index );

		this.splineService.updateIndexes( point.mainObject.spline );

		this.surfaceService.update( point.mainObject );

	}

	onUpdated ( point: SimpleControlPoint<Surface> ): void {

		this.surfaceService.update( point.mainObject );

	}

	onRemoved ( point: SimpleControlPoint<Surface> ): void {

		const index = point.mainObject.spline.controlPoints.indexOf( point );

		point.mainObject.spline.controlPoints.splice( index, 1 );

		this.splineService.updateIndexes( point.mainObject.spline );

		this.surfaceService.update( point.mainObject );

	}

	showInspector ( point: SimpleControlPoint<Surface> ): void {

		const mesh = this.surfaceService.getSurfaceMesh( point.mainObject );

		this.setInspector( new TvSurfaceInspector( point.mainObject, mesh, point ) )

	}

}
