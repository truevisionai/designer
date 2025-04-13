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
import { JunctionDebugService } from "app/services/junction/junction.debug";
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

		} else if ( type === ToolType.PropPoint ) {

			debugService = this.injector.get( PointDebugService );

		} else if ( type === ToolType.LaneHeight ) {

			debugService = this.injector.get( LaneHeightDebugService );

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


}
