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

	toXODR (): Record<string, any> {
		return {
			attr_id: this.attr_id,
			// attr_roadId: this.roadId, // roadId is not part of the OpenDRIVE standard
			attr_s: this.s,
			attr_t: this.t,
			attr_dz: this.dz,
			attr_height: this.height,
		};
	}

}
