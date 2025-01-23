/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { HasDistanceValue } from "../core/interfaces/has-distance-value";
import { TvRoad } from "../map/models/tv-road.model";
import { TvLane } from "../map/models/tv-lane";
import { Vector3 } from "app/core/maths"
import { SimpleControlPoint } from "./simple-control-point";
import { DebugLine } from "./debug-line";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

export class LanePointNode<T extends HasDistanceValue> extends SimpleControlPoint<T> {

	constructor ( public road: TvRoad, public lane: TvLane, mainObject: T, position?: Vector3 ) {

		super( mainObject, position );

	}

	get s (): number {
		return this.mainObject?.s;
	}

	set s ( value: number ) {
		this.mainObject.s = value;
	}

	update (): void {

		// here position on position we have to update s-value
		const posTheta = this.road.getPosThetaByPosition( this.position );

		if ( !posTheta ) return;

		this.s = posTheta.s;

	}

}

export class LaneSpanNode<T extends HasDistanceValue> extends DebugLine<T> {

	constructor ( public road: TvRoad, public lane: TvLane, target: T, geometry: LineGeometry, material: LineMaterial ) {

		super( target, geometry, material );

	}

	get s (): number {
		return this.target?.s;
	}

	set s ( value: number ) {
		this.target.s = value;
	}

}
