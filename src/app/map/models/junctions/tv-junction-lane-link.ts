/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from '../../../services/scene.service';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvLane } from '../tv-lane';

export class TvJunctionLaneLink {

	public incomingLane: TvLane;
	public connectingLane: TvLane;

	/**
	 *
	 * @param from ID of the incoming lane
	 * @param to ID of the connecting lane
	 */
	constructor ( from: TvLane, to: TvLane, private connection?: TvJunctionConnection ) {
		this.incomingLane = from;
		this.connectingLane = to;
	}

	get from (): number {
		return this.incomingLane?.id;
	}

	get to (): number {
		return this.connectingLane?.id;
	}

	get incomingRoad () {
		return this.incomingLane?.laneSection?.road;
	}

	get connectingRoad () {
		return this.connectingLane?.laneSection?.road;
	}

	delete () {

		this.connectingLane.laneSection.removeLane( this.connectingLane );

	}

	clone (): any {

		return new TvJunctionLaneLink( this.incomingLane, this.connectingLane, this.connection );

	}

}

