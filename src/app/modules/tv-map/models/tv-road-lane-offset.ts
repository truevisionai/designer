/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneOffsetNode } from '../../three-js/objects/lane-offset-node';
import { ThirdOrderPolynom } from './third-order-polynom';
import { TvRoad } from './tv-road.model';

export class TvRoadLaneOffset extends ThirdOrderPolynom {

	public node?: LaneOffsetNode;

	public readonly road?: TvRoad;

	constructor ( road: TvRoad, s: number, a: number, b: number, c: number, d: number ) {

		super( s, a, b, c, d );

		this.road = road;

		this.node = new LaneOffsetNode( this.road, this );

	}

	clone ( s?: number ) {

		return new TvRoadLaneOffset( this.road, s || this.s, this.a, this.b, this.c, this.d );

	}

}
