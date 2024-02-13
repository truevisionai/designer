import { HasDistanceValue } from "../core/interfaces/has-distance-value";
import { TvRoad } from "../map/models/tv-road.model";
import { TvLane } from "../map/models/tv-lane";
import { Vector3 } from "three";

import { SimpleControlPoint } from "./simple-control-point";

export class LaneNode<T extends HasDistanceValue> extends SimpleControlPoint<T> {

	constructor ( public road: TvRoad, public lane: TvLane, mainObject: T, position?: Vector3 ) {

		super( mainObject, position );

	}

	get s (): number {
		return this.mainObject?.s;
	}

	set s ( value: number ) {
		this.mainObject.s = value;
	}

}