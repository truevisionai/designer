/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvElevation } from 'app/modules/tv-map/models/tv-elevation';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';
import { DynamicControlPoint } from './dynamic-control-point';

export class RoadElevationControlPoint extends DynamicControlPoint<any> {

	static readonly TAG = 'RoadElevationNode';

	constructor ( public road: TvRoad, public elevation: TvElevation ) {

		super( elevation, road?.getPositionAt( elevation.s || 0 ).toVector3() || new Vector3() );

		this.tag = this.name = RoadElevationControlPoint.TAG;

	}

}
