/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../../map/models/tv-road.model";

export class RoadCreatedEvent {
	constructor ( public road: TvRoad, public showHelpers = false ) {
	}
}