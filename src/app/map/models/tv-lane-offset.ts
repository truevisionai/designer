/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ThirdOrderPolynom } from './third-order-polynom';
import { Maths } from 'app/utils/maths';

export class TvLaneOffset extends ThirdOrderPolynom {

	constructor ( s: number, a: number, b: number, c: number, d: number ) {

		super( s, a, b, c, d );

	}

	clone ( s?: number ): TvLaneOffset {

		return new TvLaneOffset( s || this.s, this.a, this.b, this.c, this.d );

	}

	isEquivalent ( other: TvLaneOffset, epsilon: number = 0.00001 ): boolean {

		return Maths.approxEquals( this.a, other.a, epsilon )
			&& Maths.approxEquals( this.b, other.b, epsilon )
			&& Maths.approxEquals( this.c, other.c, epsilon )
			&& Maths.approxEquals( this.d, other.d, epsilon );
	}

}
