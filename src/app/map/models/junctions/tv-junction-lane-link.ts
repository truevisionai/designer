/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SceneService } from '../../../services/scene.service';
import { TvJunctionConnection } from './tv-junction-connection';
import { TvLane } from '../tv-lane';
import { LanePathObject } from "../../../objects/lane-path-object";

export class TvJunctionLaneLink {

	public mesh: LanePathObject;

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
		// this.mesh = new LanePathObject( this.incomingRoad, this.connectingRoad, this.connection, this );
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

	show () {

		this.mesh?.show();

	}

	hide () {

		this.mesh?.hide();

	}

	highlight () {

		this.mesh?.highlight();

	}

	unhighlight () {

		this.mesh?.unhighlight();

	}

	update () {

		this.mesh?.update();

	}

	delete () {

		this.connectingLane.laneSection.removeLane( this.connectingLane );

		// TODO: check if we need to remove the whole connection if there are no more lane links

		// rebuild connecting road because it might have changed after lane link removal
		// RoadFactory.rebuildRoad( this.connectingRoad );

		SceneService.removeFromMain( this.mesh );

	}

	clone (): any {

		return new TvJunctionLaneLink( this.incomingLane, this.connectingLane, this.connection );

	}

}

