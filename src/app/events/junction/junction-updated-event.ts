import { TvJunction } from "../../modules/tv-map/models/junctions/tv-junction";

export class JunctionUpdatedEvent {
	constructor ( public junction: TvJunction ) {
	}
}