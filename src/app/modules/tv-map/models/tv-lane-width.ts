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
	public readonly road: TvRoad;

	constructor ( s: number, a: number, b: number, c: number, d: number, lane: TvLane, road: TvRoad ) {

		super( s, a, b, c, d );

		this.lane = lane;
		this.road = road;

	}


	get laneId () {
		return this.lane.id;
	}

	get roadId () {
		return this.lane.laneSection.road.id;
	}

	clone ( s?: number ) {

		return new TvLaneWidth( s || this.s, this.a, this.b, this.c, this.d, this.lane, this.road );

	}
}
