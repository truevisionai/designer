import { TvRoad } from "../../modules/tv-map/models/tv-road.model";

export class RoadCreatedEvent {
	constructor ( public road: TvRoad, public showHelpers = false ) {
	}
}