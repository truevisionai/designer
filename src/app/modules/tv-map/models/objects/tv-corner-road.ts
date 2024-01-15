import { DynamicControlPoint } from "../../../three-js/objects/dynamic-control-point";
import { TvRoadCoord } from "../TvRoadCoord";
import { TvRoad } from "../tv-road.model";
import { Vector3 } from "three";

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

	clone ( recursive?: boolean ): this {

		const clone = new ( this.constructor as any )( this.attr_id, this.road, this.s, this.t, this.dz, this.height );

		clone.copy( this );

		return clone;

	}
}
