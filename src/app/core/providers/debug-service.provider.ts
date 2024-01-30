/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { LaneDebugService } from "app/services/debug/lane-debug.service";
import { RoadDebugService } from "app/services/debug/road-debug.service";
import { DebugService } from "../interfaces/debug.service";
import { SplineDebugService } from "app/services/debug/spline-debug.service";
import { AbstractSplineDebugService } from "app/services/debug/abstract-spline-debug.service";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SurfaceDebugService } from "../../map/surface/surface.debug";
import { MapService } from "../../services/map/map.service";
import { Surface } from "../../map/surface/surface.model";
import { ToolType } from "../../tools/tool-types.enum";
import { PropPolygon } from "../../map/prop-polygon/prop-polygon.model";
import { PropPolygonDebugService } from "../../map/prop-polygon/prop-polygon.debug";
import { PointDebugService } from "../../services/debug/point-debug.service";
import { HasSplineDebugService } from "../../services/debug/has-spline-debug.service";

@Injectable( {
	providedIn: 'root'
} )
export class DebugServiceProvider {

	constructor (
		private debugService: DebugDrawService,
		private laneDebugService: LaneDebugService,
		private mapService: MapService,
		private splineDebugService: AbstractSplineDebugService,
		private roadDebug: RoadDebugService,
	) {
	}

	createDebugService ( type: ToolType ): DebugService<any> {

		switch ( type ) {

			case ToolType.Road:
				return this.createSplineDebugService();

			case ToolType.RoadCircle:
				return this.createSplineDebugService();

			case ToolType.Surface:
				return new HasSplineDebugService( this.splineDebugService );

			case ToolType.PropPoint:
				return new PointDebugService();

			case ToolType.PropPolygon:
				return new HasSplineDebugService( this.splineDebugService );

			case ToolType.PropCurve:
				return new HasSplineDebugService( this.splineDebugService );

		}

	}

	private createSurfaceDebugService (): DebugService<Surface> {

		return new SurfaceDebugService( this.splineDebugService );

	}

	private createSplineDebugService (): DebugService<AbstractSpline> {

		return new SplineDebugService( this.debugService, this.laneDebugService, this.mapService, this.splineDebugService, this.roadDebug );

	}

	private createPropPolygonDebugService (): DebugService<PropPolygon> {

		return new PropPolygonDebugService( this.splineDebugService );

	}

	private createPropPointDebugService () {

		return new PointDebugService();

	}
}
