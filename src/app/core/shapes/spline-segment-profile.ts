import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { AbstractSpline, NewSegment } from "./abstract-spline";

export class SplineSegmentProfile {

	constructor ( private spline: AbstractSpline ) {
	}

	insertSegment ( sStart: number, sEnd: number, newSegment: NewSegment ): void {

		const startSegment = this.spline.segmentMap.findAt( sStart );
		const endSegment = this.spline.segmentMap.findAt( sStart );

		if ( startSegment instanceof TvJunction || endSegment instanceof TvJunction ) {
			throw new Error( 'Start/End segment is junction' );
		}

		if ( startSegment != endSegment ) {
			throw new Error( 'Start and end segments are not same' );
		}

		const existingRoad = startSegment as TvRoad;

		if ( sStart < 10 ) {

			this.spline.shiftSegment( sEnd, existingRoad );

		} else if ( sEnd < this.spline.getLength() ) {

			this.spline.addSegment( sEnd, existingRoad.clone( 0 ) );

		}

		this.spline.addSegment( sStart, newSegment );

	}
}
