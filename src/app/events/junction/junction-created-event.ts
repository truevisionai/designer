import { TvJunction } from "../../modules/tv-map/models/junctions/tv-junction";

export class JunctionCreatedEvent {
	constructor ( public junction: TvJunction ) {
	}
}