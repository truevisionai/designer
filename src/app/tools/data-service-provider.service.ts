/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { SplineService } from "../services/spline/spline.service";
import { PropCurveService } from "../map/prop-curve/prop-curve.service";
import { SurfaceService } from "../map/surface/surface.service";
import { PropPolygonService } from "../map/prop-polygon/prop-polygon.service";
import { ToolType } from "./tool-types.enum";
import { DataService } from "../core/interfaces/data.service";
import { PropPointService } from "../map/prop-point/prop-point.service";

@Injectable( {
	providedIn: 'root'
} )
export class DataServiceProvider {

	constructor (
		private splineService: SplineService,
		private propCurveService: PropCurveService,
		private surfaceService: SurfaceService,
		private propPolygonService: PropPolygonService,
		private propPointService: PropPointService,
	) {
	}

	createDataService ( type: ToolType ): DataService<any> {

		switch ( type ) {

			case ToolType.Road:
				return this.splineService;

			case ToolType.RoadCircle:
				return this.splineService;

			case ToolType.Surface:
				return this.surfaceService;

			case ToolType.PropPoint:
				return this.propPointService;

			case ToolType.PropCurve:
				return this.propCurveService;

			case ToolType.PropPolygon:
				return this.propPolygonService;
		}

	}

}