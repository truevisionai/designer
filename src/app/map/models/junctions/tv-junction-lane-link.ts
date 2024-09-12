/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TurnType, TvContactPoint } from '../tv-common';
import { TvLane } from '../tv-lane';
import { TvRoad } from '../tv-road.model';

export class TvJunctionLaneLink {
	public incomingLane: TvLane;
	public incomingRoad?: TvRoad;

	public connectingLane: TvLane;
	public connectingRoad?: TvRoad;

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

	clone (): any {

		const link = new TvJunctionLaneLink( this.incomingLane, this.connectingLane );

		link.incomingRoad = this.incomingRoad;
		link.connectingRoad = this.connectingRoad;

		return link;

	}

	toString () {
		return `Incoming: ${ this.incomingRoad?.id } Lane: ${ this.incomingLane?.id } Connecting: ${ this.connectingRoad?.id } Lane: ${ this.connectingLane?.id } Turn: ${ this.turnType }`;
	}

}

