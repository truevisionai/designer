import { AbstractSpline, NewSegment } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { TvRoad } from "app/map/models/tv-road.model";
import { Log } from "../core/utils/log";
import {
	DuplicateKeyException,
	DuplicateModelException,
	InvalidArgumentException,
	ModelNotFoundException
} from "app/exceptions/exceptions";
import { RoadUtils } from "./road.utils";

export class SplineUtils {

	static updateSegment ( spline: AbstractSpline, sOffset: number, segment: NewSegment ): void {

		this.removeSegment( spline, segment );

		this.addSegment( spline, sOffset, segment );

	}

	static removeSegment ( spline: AbstractSpline, segment: TvRoad | TvJunction ): boolean {

		if ( !this.hasSegment( spline, segment ) ) {
			throw new ModelNotFoundException( `Segment not found: ${ segment?.toString() }` );
		}

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
			throw new InvalidArgumentException( `Spline is null: ${ sOffset }, ${ segment?.toString() }` );
		}

		if ( sOffset > spline.getLength() ) {
			throw new InvalidArgumentException( `sOffset must be less than end: ${ sOffset }, ${ spline.toString() }` );
		}

		if ( sOffset < 0 ) {
			throw new InvalidArgumentException( `sOffset must be greater than 0: ${ sOffset }, ${ spline.toString() }` );
		}

		if ( sOffset == null ) {
			throw new InvalidArgumentException( `sOffset is null: ${ sOffset }, ${ spline.toString() }, ${ segment?.toString() }` );
		}

		if ( this.hasSegment( spline, segment ) ) {
			throw new DuplicateModelException( `Segment already exists, avoid adding again: ${ sOffset }, ${ segment?.toString() }` );
		}

		if ( spline.segmentMap.hasKey( sOffset ) ) {
			throw new DuplicateKeyException( `sOffset already occupied: ${ sOffset }, ${ segment?.toString() }, ${ spline.segmentMap.keys() }` );
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

	static areLinksCorrect ( spline: AbstractSpline ): boolean {

		const segments = spline.segmentMap.toArray();

		if ( segments.length == 0 ) return true;

		if ( segments.length == 1 ) return true;

		return segments.every( ( segment, index ) => {

			const isFirst = index == 0;
			const isLast = index == segments.length - 1;

			if ( segment instanceof TvRoad ) {

				let nextCorrect: boolean
				let prevCorrect: boolean;

				if ( !isLast ) {
					nextCorrect = RoadUtils.isSuccessor( segment, segments[ index + 1 ] );
				} else {
					nextCorrect = true;
				}

				if ( !isFirst ) {
					prevCorrect = RoadUtils.isPredecessor( segment, segments[ index - 1 ] );
				} else {
					prevCorrect = true;
				}

				return nextCorrect && prevCorrect;
			}

			if ( segment instanceof TvJunction ) {
				return true;
			}

			return false;

		} )

	}
}
