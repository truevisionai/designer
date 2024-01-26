/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvJunction } from "../../map/models/junctions/tv-junction";

export class JunctionUpdatedEvent {
	constructor ( public junction: TvJunction ) {
	}
}