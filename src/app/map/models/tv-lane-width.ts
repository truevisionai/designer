/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';

export const LANE_WIDTH = {
	DEFAULT_LANE_WIDTH: 3.6
}

export class TvLaneWidth extends ThirdOrderPolynom {

	constructor ( s: number, a: number, b: number, c: number, d: number ) {

		super( s, a, b, c, d );

	}

	clone ( s?: number ): TvLaneWidth {

		return new TvLaneWidth( s || this.s, this.a, this.b, this.c, this.d );

	}
}
