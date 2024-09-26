/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from "@angular/core";
import { SplineService } from "../services/spline/spline.service";
import { PropPolygonService } from "../map/prop-polygon/prop-polygon.service";
import { ToolType } from "./tool-types.enum";
import { BaseDataService, LinkedDataService } from "../core/interfaces/data.service";
import { PropPointService } from "../map/prop-point/prop-point.service";
import { LaneService } from "../services/lane/lane.service";
import { LaneHeightService } from "app/map/lane-height/lane-height.service";
import { JunctionService } from "../services/junction/junction.service";
import { RoadService } from "app/services/road/road.service";

@Injectable( {
	providedIn: 'root'
} )
export class DataServiceProvider {

	constructor (
		private injector: Injector,
		private splineService: SplineService,
		private propPolygonService: PropPolygonService,
		private propPointService: PropPointService,
		private laneService: LaneService,
		private junctionService: JunctionService
	) {
	}

	createDataService ( type: ToolType ): BaseDataService<any> {

		switch ( type ) {

			case ToolType.Road:
				return this.splineService;

			case ToolType.RoadCircle:
				return this.splineService;

			case ToolType.PropPoint:
				return this.propPointService;

			case ToolType.PropPolygon:
				return this.propPolygonService;

			case ToolType.LaneHeight:
				return this.laneService;

			case ToolType.TrafficLight:
				return this.junctionService;

			case ToolType.TextMarkingTool:
				return this.injector.get( RoadService );
		}

	}

	createLinkedDataService ( type: ToolType ): LinkedDataService<any, any> {

		switch ( type ) {

			case ToolType.LaneHeight:
				return this.injector.get( LaneHeightService );
		}

	}

}
