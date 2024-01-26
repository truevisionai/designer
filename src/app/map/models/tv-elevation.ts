/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';

export class TvElevation extends ThirdOrderPolynom {

	clone ( s: number ): TvElevation {

		return new TvElevation( s, this.a, this.b, this.c, this.d );

	}

}
