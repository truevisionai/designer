/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';
import { TvLane } from './tv-lane';

export class TvLaneWidth extends ThirdOrderPolynom {

	public readonly lane: TvLane;

	constructor ( s: number, a: number, b: number, c: number, d: number, lane: TvLane ) {

		super( s, a, b, c, d );

		this.lane = lane;

	}

	clone ( s?: number ) {

		return new TvLaneWidth( s || this.s, this.a, this.b, this.c, this.d, this.lane );

	}
}
