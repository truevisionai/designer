/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { ManeuverRoadDebugger } from 'app/map/maneuver-road/maneuver-road.debugger';
import { JunctionDebugService } from 'app/services/junction/junction.debug';
import { JunctionService } from 'app/services/junction/junction.service';
import { AutoSignalizeJunctionService } from './auto-signalize-junction.service';
import { SignalJunctionDebugger } from './signal-junction.debugger';
import { JunctionGateDebugger } from "./junction-gate.debugger";
import { JunctionManeuverDebugger } from "./junction-maneuver.debugger";

@Injectable( {
	providedIn: 'root'
} )
export class TrafficLightToolService {

	constructor (
		public junctionService: JunctionService,
		public autoSignalService: AutoSignalizeJunctionService,
		public defaultDebugger: JunctionDebugService,
		public maneuverDebugger: ManeuverRoadDebugger,
		public junctionDebugger: SignalJunctionDebugger,
		public junctionGateDebugger: JunctionGateDebugger,
		public junctionManeuverDebugger: JunctionManeuverDebugger
	) {
	}

}
