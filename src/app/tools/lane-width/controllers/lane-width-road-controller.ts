/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { TvRoad } from "app/map/models/tv-road.model";
import { RoadController } from "app/core/controllers/road-handler";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthRoadController extends RoadController {

	constructor () {

		super()

	}

	createAt ( road: TvRoad, e: PointerEventData ) {

		// dont create for road right now

	}

}
