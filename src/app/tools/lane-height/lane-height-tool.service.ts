/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { LaneHeightDebugService } from './lane-height.debug';
import { LaneService } from 'app/services/lane/lane.service';
import { RoadService } from 'app/services/road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightToolService {

	constructor (
		public toolDebugger: LaneHeightDebugService,
		public laneService: LaneService,
		public roadService: RoadService,
	) { }

}
