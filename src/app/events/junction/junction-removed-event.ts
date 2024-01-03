import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunction } from "../../modules/tv-map/models/junctions/tv-junction";

export class JunctionRemovedEvent {

	constructor (
		public junction: TvJunction,
		public spline?: AbstractSpline
	) {
	}
}
