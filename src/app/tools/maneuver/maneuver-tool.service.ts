/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { SplineService } from 'app/services/spline/spline.service';
import { ManeuverRoadDebugger } from "../../map/maneuver-road/maneuver-road.debugger";
import { JunctionDebugService } from "../../services/junction/junction.debug";
import { JunctionService } from "../../services/junction/junction.service";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolService {

	constructor (
		public splineService: SplineService,
		public junctionService: JunctionService,
		public maneuverDebugger: ManeuverRoadDebugger,
		public junctionDebugger: JunctionDebugService,
	) { }

}
