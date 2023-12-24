/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';

export class TvRoadLaneOffset extends ThirdOrderPolynom {

	constructor ( s: number, a: number, b: number, c: number, d: number ) {

		super( s, a, b, c, d );

	}

	clone ( s?: number ) {

		return new TvRoadLaneOffset( s || this.s, this.a, this.b, this.c, this.d );

	}

}
