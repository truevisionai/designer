/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from '../models/third-order-polynom';

export class TvElevation extends ThirdOrderPolynom {

	constructor ( s: number, a: number, b: number, c: number, d: number ) {

		super( s, a, b, c, d );

	}

	clone ( s: number ): TvElevation {

		return new TvElevation( s, this.a, this.b, this.c, this.d );

	}

}
