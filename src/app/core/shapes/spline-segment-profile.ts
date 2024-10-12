import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { AbstractSpline, NewSegment } from "./abstract-spline";
import { OrderedMap } from "../models/ordered-map";

export class SplineSegmentProfile {

	private segments: OrderedMap<NewSegment>;

	constructor ( private spline: AbstractSpline ) {
		this.segments = new OrderedMap();
	}

	getSegmentMap (): OrderedMap<NewSegment> {
		return this.segments;
	}

	getSegmentStart ( segment: NewSegment ): number {
		return this.segments.findKey( segment );
	}

	getSegmentEnd ( segment: NewSegment ): number {
		return this.segments.getNextKey( segment ) || this.spline.getLength()
	}

	getStartEnd ( segment: NewSegment ): { start: number; end: number; } {

		const start = this.getSegmentStart( segment );
		const end = this.getSegmentEnd( segment );

		return { start, end };

	}

	insertSegment ( sStart: number, sEnd: number, newSegment: NewSegment ): void {

		const startSegment = this.spline.getSegmentAt( sStart );
		const endSegment = this.spline.getSegmentAt( sStart );

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
