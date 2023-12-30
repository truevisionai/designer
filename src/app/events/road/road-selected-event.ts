import { TvRoad } from "../../modules/tv-map/models/tv-road.model";

export class RoadSelectedEvent {
	constructor ( public road: TvRoad ) {
	}
}