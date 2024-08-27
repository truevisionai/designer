/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SplineService } from 'app/services/spline/spline.service';
import { ManeuverRoadDebugger } from "../../map/maneuver-road/maneuver-road.debugger";
import { JunctionDebugService } from "../../services/junction/junction.debug";
import { JunctionService } from "../../services/junction/junction.service";
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { ConnectionService } from 'app/map/junction/connection.service';
import { BaseToolService } from "../base-tool.service";
import { ConnectionFactory } from 'app/factories/connection.factory';

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolHelper {

	constructor (
		public base: BaseToolService,
		public splineService: SplineService,
		public junctionService: JunctionService,
		public maneuverDebugger: ManeuverRoadDebugger,
		public junctionDebugger: JunctionDebugService,
		public connectionService: ConnectionService,
		public connectionFactory: ConnectionFactory,
	) { }

	addControlPoint ( spline: AbstractSpline, point: SplineControlPoint ) {
		this.splineService.addPointAndUpdateSpline( spline, point );
	}

	removeControlPoint ( spline: AbstractSpline, point: SplineControlPoint ) {
		this.splineService.removePointAndUpdateSpline( spline, point );
	}

}
