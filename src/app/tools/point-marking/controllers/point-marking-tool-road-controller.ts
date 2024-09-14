/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/controllers/empty-controller";
import { TvRoad } from "app/map/models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolRoadController extends EmptyController<TvRoad> {

	constructor () {
		super();
	}

}
