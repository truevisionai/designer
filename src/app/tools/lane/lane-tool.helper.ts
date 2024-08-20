/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { LaneDebugService } from 'app/services/debug/lane-debug.service';
import { BaseToolService } from '../base-tool.service';
import { LaneService } from 'app/services/lane/lane.service';
import { RoadService } from 'app/services/road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneToolHelper {

	constructor (
		public base: BaseToolService,
		public laneDebug: LaneDebugService,
		public laneService: LaneService,
		public roadService: RoadService,
	) {
	}
}
