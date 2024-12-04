/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';
import { TvLane } from "./tv-lane";

export class TvLaneBorder extends ThirdOrderPolynom {

	private readonly lane: TvLane;

	constructor ( s: number, a: number, b: number, c: number, d: number, lane?: TvLane ) {

		super( s, a, b, c, d );

		this.lane = lane;

	}

	clone ( s?: number ): TvLaneBorder {

		return new TvLaneBorder( s || this.s, this.a, this.b, this.c, this.d, this.lane );

	}
}
