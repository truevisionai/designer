/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { PointMarkingToolDebugger } from "./point-marking-tool.debugger";
import { RoadObjectService } from 'app/map/road-object/road-object.service';

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolService {

	constructor (
		public base: BaseToolService,
		public toolDebugger: PointMarkingToolDebugger,
		public roadObjectService: RoadObjectService,
	) {
	}
}
