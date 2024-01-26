/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../../map/models/tv-road.model";

export class RoadRemovedEvent {
	constructor ( public road: TvRoad, public hideHelpers = true ) {
	}
}