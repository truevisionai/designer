/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from "../../services/map/map.service";
import { BaseToolService } from '../base-tool.service';
import { ControlPointFactory } from "../../factories/control-point.factory";

@Injectable( {
	providedIn: 'root'
} )
export class PropPolygonToolService {

	constructor (
		public base: BaseToolService,
		public mapService: MapService,
		public controlPointFactory: ControlPointFactory,
	) {
	}


}
