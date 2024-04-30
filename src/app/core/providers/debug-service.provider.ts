/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from "@angular/core";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { IDebugger } from "../interfaces/debug.service";
import { SplineDebugService } from "app/services/debug/spline-debug.service";
import { MapService } from "../../services/map/map.service";
import { ToolType } from "../../tools/tool-types.enum";
import { PointDebugService } from "../../services/debug/point-debug.service";
import { HasSplineDebugService } from "../../services/debug/has-spline-debug.service";
import { LaneHeightDebugService } from "../../map/lane-height/lane-height.debug";
import { BaseLaneDebugService } from "../interfaces/lane-node.debug";
import { JunctionDebugService, ManeuverMesh } from "app/services/junction/junction.debug";
import { ManeuverRoadDebugger } from "app/map/maneuver-road/maneuver-road.debugger";
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { ControlPointDebugger } from "../../services/debug/control-point.debugger";

@Injectable( {
	providedIn: 'root'
} )
export class DebugServiceProvider {

	static instance: DebugServiceProvider;

	constructor (
		private injector: Injector,
		private mapService: MapService,
		public debugDrawService: DebugDrawService,
	) {
		DebugServiceProvider.instance = this;
	}

	createDebugService ( type: ToolType ): IDebugger<any, any> {

		let debugService: IDebugger<any, any>;

		if ( type === ToolType.Road ) {

			debugService = this.injector.get( SplineDebugService );

		} else if ( type === ToolType.RoadCircle ) {

			debugService = this.injector.get( SplineDebugService );

		} else if ( type === ToolType.Surface ) {

			debugService = this.injector.get( HasSplineDebugService );

		} else if ( type === ToolType.PropPoint ) {

			debugService = this.injector.get( PointDebugService );

		} else if ( type === ToolType.PropPolygon ) {

			debugService = this.injector.get( HasSplineDebugService );

		} else if ( type === ToolType.PropCurve ) {

			debugService = this.injector.get( HasSplineDebugService );

		} else if ( type === ToolType.LaneHeight ) {

			debugService = this.injector.get( LaneHeightDebugService );

		} else if ( type === ToolType.Junction ) {

			debugService = this.injector.get( JunctionDebugService );

		} else if ( type === ToolType.Maneuver ) {

			debugService = this.injector.get( JunctionDebugService );

		}

		if ( debugService instanceof BaseLaneDebugService ) {

			debugService.debugDrawService = this.debugDrawService;

			debugService.mapService = this.mapService;

		}

		return debugService;
	}

	createByObjectType ( type: ToolType, object: any ): IDebugger<any, any> {

		let debugService: IDebugger<any, any>;

		if ( object instanceof ManeuverMesh ) {

			debugService = this.injector.get( ManeuverRoadDebugger );

		} else if ( object instanceof TvJunction ) {

			debugService = this.injector.get( JunctionDebugService );

		} else if ( object instanceof AbstractControlPoint ) {

			debugService = this.injector.get( ControlPointDebugger );

		}

		if ( debugService instanceof BaseLaneDebugService ) {

			debugService.debugDrawService = this.debugDrawService;

			debugService.mapService = this.mapService;

		}

		return debugService;
	}

}
