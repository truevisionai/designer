import { Injectable } from "@angular/core";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { LaneDebugService } from "app/services/debug/lane-debug.service";
import { RoadDebugService } from "app/services/debug/road-debug.service";
import { DebugService } from "./debug.service";
import { SplineDebugService } from "app/services/debug/spline-debug.service";
import { AbstractSplineDebugService } from "app/services/debug/abstract-spline-debug.service";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { SurfaceDebugService } from "../../tools/surface/surface-debug.service";
import { MapService } from "../map/map.service";
import { TvSurface } from "../../map/models/tv-surface.model";
import { ToolType } from "../../tools/tool-types.enum";

@Injectable( {
	providedIn: 'root'
} )
export class DebugServiceFactory {

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
				return this.createSurfaceDebugService();

		}

	}

	createSurfaceDebugService (): DebugService<TvSurface> {

		return new SurfaceDebugService( this.splineDebugService );

	}

	createSplineDebugService (): DebugService<AbstractSpline> {

		return new SplineDebugService( this.debugService, this.laneDebugService, this.mapService, this.splineDebugService, this.roadDebug );

	}

}
