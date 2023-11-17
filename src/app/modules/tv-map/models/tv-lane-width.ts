/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneWidthNode } from '../../three-js/objects/lane-width-node';
import { ThirdOrderPolynom } from './third-order-polynom';
import { TvLane } from './tv-lane';
import { TvRoad } from './tv-road.model';

export class TvLaneWidth extends ThirdOrderPolynom {

	public node?: LaneWidthNode;

	public readonly lane: TvLane;

	constructor ( s: number, a: number, b: number, c: number, d: number, lane: TvLane ) {

		super( s, a, b, c, d );

		this.lane = lane;

	}


	get laneId () {
		return this.lane.id;
	}

	get roadId () {
		return this.lane.laneSection.road.id;
	}

	get road () {
		return this.lane.laneSection.road;
	}

	clone ( s?: number ) {

		return new TvLaneWidth( s || this.s, this.a, this.b, this.c, this.d, this.lane );

	}
}