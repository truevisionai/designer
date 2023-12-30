import { TvRoad } from "../../modules/tv-map/models/tv-road.model";

export class RoadUpdatedEvent {
	constructor ( public road: TvRoad, public showHelpers = false ) {
	}
}