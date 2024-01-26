/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunction } from "../../map/models/junctions/tv-junction";

export class JunctionRemovedEvent {

	constructor (
		public junction: TvJunction,
		public spline?: AbstractSpline
	) {
	}
}
