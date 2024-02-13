/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { LaneDebugService } from "app/services/debug/lane-debug.service";
import { RoadDebugService } from "app/services/debug/road-debug.service";
import { BaseDebugService, DebugService } from "../interfaces/debug.service";
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
import { LaneHeightDebugService } from "../../map/lane-height/lane-height.debug";
import { BaseLaneDebugService } from "../interfaces/lane-node.debug";

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
		public debugDrawService: DebugDrawService,
	) {
	}

	createDebugService ( type: ToolType ): DebugService<any, any> {

		let debugService: DebugService<any, any>;

		switch ( type ) {

			case ToolType.Road:
				debugService = this.createSplineDebugService();
				break;

			case ToolType.RoadCircle:
				debugService = this.createSplineDebugService();
				break;

			case ToolType.Surface:
				debugService = new HasSplineDebugService( this.splineDebugService );
				break;

			case ToolType.PropPoint:
				debugService = new PointDebugService();
				break;

			case ToolType.PropPolygon:
				debugService = new HasSplineDebugService( this.splineDebugService );
				break;

			case ToolType.PropCurve:
				debugService = new HasSplineDebugService( this.splineDebugService );
				break;

			case ToolType.LaneHeight:
				debugService = new LaneHeightDebugService();
				break;

		}

		if ( debugService instanceof BaseLaneDebugService ) {

			debugService.debugDrawService = this.debugDrawService;

			debugService.mapService = this.mapService;

		}

		return debugService;
	}

	private createSurfaceDebugService (): BaseDebugService<Surface> {

		return new SurfaceDebugService( this.splineDebugService );

	}

	private createSplineDebugService (): BaseDebugService<AbstractSpline> {

		return new SplineDebugService( this.debugService, this.laneDebugService );

	}

	private createPropPolygonDebugService (): BaseDebugService<PropPolygon> {

		return new PropPolygonDebugService( this.splineDebugService );

	}

	private createPropPointDebugService () {

		return new PointDebugService();

	}
}
