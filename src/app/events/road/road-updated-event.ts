/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../../map/models/tv-road.model";

export class RoadUpdatedEvent {
	constructor ( public road: TvRoad ) {
	}
}
