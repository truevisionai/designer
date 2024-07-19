import { AbstractSpline, SplineType } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";

export class SplineUtils {

	static findSuccessor ( spline: AbstractSpline ): TvRoad | TvJunction | null {

		const segment = spline.segmentMap.getLast();

		if ( !segment ) return;

		if ( !( segment instanceof TvRoad ) ) return;

		if ( !segment.successor ) return;

		return segment.successor.element;

	}

	static findPredecessor ( spline: AbstractSpline ): TvRoad | TvJunction | null {

		const segment = spline.segmentMap.getFirst();

		if ( !segment ) return;

		if ( !( segment instanceof TvRoad ) ) return;

		if ( !segment.predecessor ) return;

		return segment.predecessor.element;

	}

	static isSuccessorJunction ( spline: AbstractSpline ): boolean {

		return this.findSuccessor( spline ) instanceof TvJunction;

	}

	static isPredecessorJunction ( spline: AbstractSpline ): boolean {

		return this.findPredecessor( spline ) instanceof TvJunction;

	}

}
