/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector2 } from "app/core/maths"

export class TvObjectVertexRoad {

	constructor (
		public id: number,
		public s: number,
		public t: number,
		public dz?: number,
		public dimensions?: Vector2,
		public radius?: number,
		public intersectionPoint?: boolean,
	) {
	}

	clone (): TvObjectVertexRoad {

		return new TvObjectVertexRoad(
			this.id,
			this.s,
			this.t,
			this.dz,
			this.dimensions?.clone(),
			this.radius,
			this.intersectionPoint
		);
	}
}
