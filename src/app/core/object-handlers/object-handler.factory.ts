/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from "@angular/core";
import { ObjectHandler } from "./object-handler";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadObjectHandler } from "./road-object-handler";
import { TvLane } from "../../map/models/tv-lane";
import { LaneObjectHandler } from "./lane-object-handler";

@Injectable( {
	providedIn: 'root'
} )
export class ObjectHandlerFactory {

	constructor ( private injector: Injector ) {
	}

	createRoadHandler (): ObjectHandler<TvRoad> {

		return this.injector.get( RoadObjectHandler );

	}

	createLaneHandler (): ObjectHandler<TvLane> {

		return this.injector.get( LaneObjectHandler );

	}

}