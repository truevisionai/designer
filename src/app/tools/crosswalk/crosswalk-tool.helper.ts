/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from "../base-tool.service";
import { CrosswalkToolDebugger } from "./crosswalk-tool-debugger";
import { RoadService } from "../../services/road/road.service";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkToolHelper {

	constructor (
		public roadService: RoadService,
		public toolDebugger: CrosswalkToolDebugger,
		public base: BaseToolService,
	) {
	}
}
