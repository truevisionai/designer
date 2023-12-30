import { TvRoad } from "../../modules/tv-map/models/tv-road.model";

export class RoadUnselectedEvent {
	constructor ( public road: TvRoad ) {
	}
}