/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from "@angular/core";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { IDebugger } from "../interfaces/debug.service";
import { MapService } from "../../services/map/map.service";
import { ToolType } from "../../tools/tool-types.enum";
import { PointDebugService } from "../../services/debug/point-debug.service";
import { HasSplineDebugService } from "../../services/debug/has-spline-debug.service";
import { BaseLaneDebugService } from "../interfaces/lane-node.debug";
import { JunctionDebugService, ManeuverMesh } from "app/services/junction/junction.debug";
import { ManeuverRoadDebugger } from "app/map/maneuver-road/maneuver-road.debugger";
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { ControlPointDebugger } from "../../services/debug/control-point.debugger";
import { LaneHeightDebugService } from "app/tools/lane-height/lane-height.debug";
import { LaneMarkingToolDebugger } from "app/tools/lane-marking/lane-marking-tool.debugger";
import { TextMarkingToolDebugger } from "app/tools/text-marking/text-marking-tool.debugger";
import { RoadToolDebugger } from "../../tools/road/road-tool.debugger";

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

		if ( type === ToolType.RoadCircle ) {

			debugService = this.injector.get( RoadToolDebugger );

		} else if ( type === ToolType.Surface ) {

			debugService = this.injector.get( HasSplineDebugService );

		} else if ( type === ToolType.PropPoint ) {

			debugService = this.injector.get( PointDebugService );

		} else if ( type === ToolType.PropPolygon ) {

			debugService = this.injector.get( HasSplineDebugService );

		} else if ( type === ToolType.LaneHeight ) {

			debugService = this.injector.get( LaneHeightDebugService );

		} if ( type === ToolType.Maneuver ) {

			debugService = this.injector.get( JunctionDebugService );

		} else if ( type === ToolType.TrafficLight ) {

			debugService = this.injector.get( JunctionDebugService );

		} else if ( type == ToolType.LaneMarking ) {

			debugService = this.injector.get( LaneMarkingToolDebugger );

		} else if ( type == ToolType.TextMarkingTool ) {

			debugService = this.injector.get( TextMarkingToolDebugger );

		}

		if ( debugService instanceof BaseLaneDebugService ) {

			debugService.debugDrawService = this.debugDrawService;

			debugService.mapService = this.mapService;

		}

		return debugService;
	}

	createByObjectType ( toolType: ToolType, object: any ): IDebugger<any, any> {

		let debugService: IDebugger<any, any>;

		if ( object instanceof ManeuverMesh ) {

			debugService = this.injector.get( ManeuverRoadDebugger );

			if ( toolType === ToolType.TrafficLight ) {

				( debugService as ManeuverRoadDebugger ).shouldShowControlPoints = false;
				( debugService as ManeuverRoadDebugger ).shouldShowLines = false;

			}

		} else if ( object instanceof TvJunction ) {

			debugService = this.injector.get( JunctionDebugService );

			if ( toolType === ToolType.TrafficLight ) {

				( debugService as JunctionDebugService ).shouldShowEntries = false;

			} else {

				( debugService as JunctionDebugService ).shouldShowEntries = true;

			}

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
