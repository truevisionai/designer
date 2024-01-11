import { TvLaneType } from "app/modules/tv-map/models/tv-common";
import { TvLane } from "app/modules/tv-map/models/tv-lane";

export class LaneTypeChangedEvent {

	constructor (
		public lane: TvLane,
		public newType: TvLaneType,
		public oldType: TvLaneType
	) { }

}
