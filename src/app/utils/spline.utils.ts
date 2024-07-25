import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { Log } from "../core/utils/log";

export class SplineUtils {

	static removeSegment ( spline: AbstractSpline, segment: TvRoad | TvJunction ): boolean {

		if ( !this.hasSegment( spline, segment ) ) return false;

		spline.segmentMap.remove( segment );

		return true;

	}

	static hasSegment ( spline: AbstractSpline, segment: TvRoad | TvJunction | null ) {

		if ( !spline ) {
			Log.error( 'Spline is null', segment?.toString() );
			return;
		}

		return spline.segmentMap.contains( segment );

	}

	static addSegment ( spline: AbstractSpline, sOffset: number, segment: TvRoad | TvJunction | null ) {

		if ( !spline ) {
			Log.error( 'Spline is null', sOffset, segment?.toString() );
			return;
		}

		if ( sOffset > spline.getLength() ) {
			Log.error( 'sOffset must be less than end', sOffset, spline.toString(), spline?.toString() );
			return;
		}

		if ( sOffset < 0 ) {
			Log.error( 'sOffset must be greater than 0', sOffset, spline.toString(), spline?.toString() );
			return;
		}

		if ( sOffset == null ) {
			Log.error( 'sOffset is null', sOffset, spline.toString(), segment?.toString() );
			return;
		}

		if ( this.hasSegment( spline, segment ) ) {
			Log.error( 'Segment already exists, avoid adding again', sOffset, segment?.toString() );
			return;
		}

		if ( spline.segmentMap.hasKey( sOffset ) ) {
			Log.error( 'sOffset already occupied', sOffset, segment?.toString(), spline.segmentMap.keys() );
			return;
		}

		spline.segmentMap.remove( segment );

		spline.segmentMap.set( sOffset, segment );

		if ( segment instanceof TvRoad ) {

			segment.spline = spline;

			segment.sStart = sOffset;

		}

	}

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

	static isConnectedToJunction ( spline: AbstractSpline ): boolean {

		return this.isSuccessorJunction( spline ) || this.isPredecessorJunction( spline );

	}

	static isConnection ( spline: AbstractSpline ) {

		if ( spline.segmentMap.length != 1 ) {
			return false;
		}

		const segment = spline.segmentMap.getFirst();

		if ( !( segment instanceof TvRoad ) ) {
			return false;
		}

		return segment.isJunction;
	}

	static getSuccessorSpline ( spline: AbstractSpline ): AbstractSpline {

		const lastSegment = spline.segmentMap.getLast();

		if ( !lastSegment ) return;

		if ( !( lastSegment instanceof TvRoad ) ) return;

		const road = lastSegment;

		if ( !road.successor ) return;

		if ( !road.successor.isRoad ) return;

		const successorRoad = road.successor.element as TvRoad;

		return successorRoad.spline;

	}

	static getPredecessorSpline ( spline: AbstractSpline ): AbstractSpline {

		const firstSegment = spline.segmentMap.getFirst();

		if ( !firstSegment ) return;

		if ( !( firstSegment instanceof TvRoad ) ) return;

		const road = firstSegment;

		if ( !road.predecessor ) return;

		if ( !road.predecessor.isRoad ) return;

		const predecessorRoad = road.predecessor.element as TvRoad;

		return predecessorRoad.spline;

	}
}
