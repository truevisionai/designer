/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from "../base-tool.service";
import { RoadObjectService } from "../../map/road-object/road-object.service";
import { RoadObjectFactory } from 'app/services/road-object/road-object.factory';
import { CrosswalkToolDebugger } from "./crosswalk-tool-debugger";
import { RoadService } from "../../services/road/road.service";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkToolService {

	constructor (
		public roadService: RoadService,
		public toolDebugger: CrosswalkToolDebugger,
		public base: BaseToolService,
		public objectService: RoadObjectService,
		public objectFactory: RoadObjectFactory
	) {
	}
}
