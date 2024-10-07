/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

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
import { Vector2 } from "three";
import { TvAbstractRoadGeometry } from "../map/models/geometries/tv-abstract-road-geometry";
import { TvContactPoint } from "app/map/models/tv-common";
import { LinkFactory } from "app/map/models/link-factory";

export function getArcParams ( p1: Vector2, p2: Vector2, dir1: Vector2, dir2: Vector2 ): number[] {

	const distance = p1.distanceTo( p2 );

	const normalisedDotProduct = new Vector2()
		.copy( dir1 )
		.normalize()
		.dot( new Vector2().copy( dir2 ).normalize() );

	const alpha = Math.acos( normalisedDotProduct );

	const r = distance / 2 / Math.sin( alpha / 2 );

	const length = r * alpha;

	const ma = dir1.x, mb = dir1.y, mc = -mb, md = ma;

	const det = 1 / ( ma * md - mb * mc );

	const mia = det * md, mib = -mb * det, mic = -mc * det, mid = ma * det;

	const p2proj = new Vector2().subVectors( p2, p1 );

	p2proj.set( p2proj.x * mia + p2proj.y * mic, p2proj.x * mib + p2proj.y * mid );

	return [ r, alpha, length, Math.sign( p2proj.y ) ];
}

export function breakGeometries ( geometries: TvAbstractRoadGeometry[], cutStart: number, cutEnd: number | null ): TvAbstractRoadGeometry[] {

	let distance = 0;

	const sEnd = cutEnd ?? Infinity;

	const newGeometries: TvAbstractRoadGeometry[] = [];

	for ( const geometry of geometries ) {

		if ( geometry.endS <= cutStart || geometry.s >= sEnd ) continue;

		const newGeometry = geometry.clone();

		newGeometry.s = distance;

		const geometryStart = Math.max( geometry.s, cutStart );
		const geometryEnd = Math.min( geometry.endS, sEnd );

		const posTheta = geometry.getRoadCoord( geometryStart );

		newGeometry.x = posTheta.x;
		newGeometry.y = posTheta.y;
		newGeometry.hdg = posTheta.hdg;
		newGeometry.length = geometryEnd - geometryStart;

		newGeometries.push( newGeometry );

		distance += newGeometry.length;

	}

	return newGeometries;
}

export class SplineUtils {

	static updateInternalLinks ( spline: AbstractSpline ): void {

		const segments = spline.getSegments();

		for ( const segment of segments ) {

			const prevSegment = spline.getPreviousSegment( segment );
			const nextSegment = spline.getNextSegment( segment );

			if ( segment instanceof TvRoad ) {
				this.linkSuccessor( segment, nextSegment );
				this.setPredecessor( segment, prevSegment );
			}

		}

	}

	private static linkSuccessor ( road: TvRoad, nextSegment: TvRoad | TvJunction ): void {

		if ( nextSegment instanceof TvRoad ) {

			road.linkSuccessor( nextSegment, TvContactPoint.START );

		} else if ( nextSegment instanceof TvJunction ) {

			road.successor = LinkFactory.createJunctionLink( nextSegment );

		}

	}

	private static setPredecessor ( road: TvRoad, prevSegment: TvRoad | TvJunction ): void {

		if ( prevSegment instanceof TvRoad ) {

			road.linkPredecessor( prevSegment, TvContactPoint.END );

		} else if ( prevSegment instanceof TvJunction ) {

			road.predecessor = LinkFactory.createJunctionLink( prevSegment );

		}

	}

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
