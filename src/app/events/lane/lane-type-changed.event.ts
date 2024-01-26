/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLaneType } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";

export class LaneTypeChangedEvent {

	constructor (
		public lane: TvLane,
		public newType: TvLaneType,
		public oldType: TvLaneType
	) { }

}
