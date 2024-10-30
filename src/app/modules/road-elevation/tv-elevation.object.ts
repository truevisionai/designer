/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvElevation } from 'app/map/road-elevation/tv-elevation.model';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Vector3 } from 'three';
import { DynamicControlPoint } from '../../objects/dynamic-control-point';

export class ElevationControlPoint extends DynamicControlPoint<any> {

	static readonly TAG = 'RoadElevationNode';

	constructor ( public road: TvRoad, public elevation: TvElevation ) {

		super( elevation, road?.getPosThetaAt( elevation.s || 0 ).toVector3() || new Vector3() );

		this.tag = this.name = ElevationControlPoint.TAG;

	}

}
