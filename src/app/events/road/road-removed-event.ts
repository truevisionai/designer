import { TvRoad } from "../../modules/tv-map/models/tv-road.model";

export class RoadRemovedEvent {
	constructor ( public road: TvRoad, public hideHelpers = true ) {
	}
}