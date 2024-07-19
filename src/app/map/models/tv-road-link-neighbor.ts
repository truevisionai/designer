/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "./tv-road.model";
import { TvContactPoint } from "./tv-common";

export class TvRoadLinkNeighbor {

	public element: TvRoad;
	public contact: TvContactPoint;

	constructor ( element: TvRoad, contact: TvContactPoint ) {
		this.element = element
		this.contact = contact;
	}
}
