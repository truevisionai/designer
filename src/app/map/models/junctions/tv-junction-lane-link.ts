/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TurnType } from '../tv-common';
import { TvLane } from '../tv-lane';
import { TvRoad } from '../tv-road.model';

export class TvJunctionLaneLink {

	public incomingLane: TvLane;
	public connectingLane: TvLane;

	/**
	 * can be useful to track if the link is modified
	 * for exporting as link connection or different
	 */
	public dirty: boolean = false;

	public turnType: TurnType;

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

	get connectingRoad (): TvRoad {
		return this.connectingLane.getRoad();
	}

	get incomingRoad (): TvRoad {
		return this.incomingLane.getRoad();
	}

	clone (): TvJunctionLaneLink {
		return new TvJunctionLaneLink( this.incomingLane, this.connectingLane );
	}

	toString () {
		return `IncomingLane: ${ this.incomingLane.id } ConnectingLane: ${ this.connectingLane.id } Turn: ${ this.turnType }`;
	}

	matchesIncomingLane ( lane: TvLane ): boolean {
		return this.incomingLane.isEqualTo( lane );
	}
}

