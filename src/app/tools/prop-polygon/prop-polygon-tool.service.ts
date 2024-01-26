/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from "../../services/map/map.service";
import { BaseToolService } from '../base-tool.service';

@Injectable( {
	providedIn: 'root'
} )
export class PropPolygonToolService {

	constructor (
		public base: BaseToolService,
		public mapService: MapService,
	) {
	}
}
