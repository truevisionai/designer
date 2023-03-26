/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Object3D } from 'three';
import { ThirdOrderPolynom } from './third-order-polynom';

export class TvRoadLaneOffset extends ThirdOrderPolynom {

	public mesh?: Object3D;

	clone ( s?: number ) {

		return new TvRoadLaneOffset( s || this.s, this.a, this.b, this.c, this.d );

	}

}
