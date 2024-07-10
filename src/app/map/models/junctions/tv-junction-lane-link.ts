/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvContactPoint } from '../tv-common';
import { TvLane } from '../tv-lane';
import { TvRoad } from '../tv-road.model';

export class TvJunctionLaneLink {

	public incomingLane: TvLane;
	public incomingRoad?: TvRoad;
	public incomingContactPoint?: TvContactPoint;

	public connectingLane: TvLane;
	public connectingRoad?: TvRoad;
	public connectingContactPoint?: TvContactPoint;

	/**
	 *
	 * @param from ID of the incoming lane
	 * @param to ID of the connecting lane
	 */
	constructor ( from: TvLane, to: TvLane ) {
		this.incomingLane = from;
		this.connectingLane = to;
	}

	get from (): number {
		return this.incomingLane?.id;
	}

	get to (): number {
		return this.connectingLane?.id;
	}

	clone (): any {

		const link = new TvJunctionLaneLink( this.incomingLane, this.connectingLane );

		link.incomingRoad = this.incomingRoad;
		link.connectingRoad = this.connectingRoad;
		link.incomingContactPoint = this.incomingContactPoint;
		link.connectingContactPoint = this.connectingContactPoint;

		return link;

	}

}

