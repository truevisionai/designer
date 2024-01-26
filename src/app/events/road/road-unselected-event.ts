/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../../map/models/tv-road.model";

export class RoadUnselectedEvent {
	constructor ( public road: TvRoad ) {
	}
}