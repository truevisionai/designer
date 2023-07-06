/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadElevationNode } from 'app/modules/three-js/objects/road-elevation-node';
import { ThirdOrderPolynom } from './third-order-polynom';

export class TvElevation extends ThirdOrderPolynom {

	node: RoadElevationNode;

	clone ( s: number ): TvElevation {

		return new TvElevation( s, this.a, this.b, this.c, this.d );

	}

}
