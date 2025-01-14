/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../tv-road.model";
import { Vector3 } from "app/core/maths"

/**
 * Defines a corner point on the object’s outline in road co-ordinates..
 */
export class TvCornerRoad {

	constructor (
		public attr_id: number,
		public road: TvRoad,
		public s: number,
		public t: number,
		public dz: number = 0,
		public height: number = 0,
	) {

	}

	getPosition (): Vector3 {

		return this.road.getPosThetaAt( this.s, this.t ).position;

	}

	clone ( recursive?: boolean ): TvCornerRoad {

		return new TvCornerRoad( this.attr_id, this.road, this.s, this.t, this.dz, this.height );

	}
}
