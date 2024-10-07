/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { Box2, Vector3 } from "three";

export class IntersectionGroup {


	/**
	 * Positions of intersections in this group
	 */
	// public intersections: SplineIntersection[] = [];
	public intersections: Map<string, SplineIntersection> = new Map();

	/**
	 * Unique splines involved in the intersections of this group
	 */
	private splines: Set<AbstractSpline> = new Set();

	public centroid: Vector3;

	public area: Box2;

	constructor ( i: SplineIntersection ) {

		this.area = new Box2();

		this.addSplineIntersection( i );

	}

	addSplineIntersection ( i: SplineIntersection ) {

		if ( !this.intersections.has( i.getKey() ) ) {
			this.intersections.set( i.getKey(), i );
		}

		this.splines.add( i.spline );
		this.splines.add( i.otherSpline );

		// Expand the group area to include the new intersection area
		this.area.expandByPoint( i.area.min );
		this.area.expandByPoint( i.area.max );
	}

	/**
	 * Calculates the centroid of the intersections as the representative position
	 * @returns Vector3
	 */
	getRepresentativePosition (): Vector3 {

		if ( this.centroid ) return this.centroid;

		let x = 0, y = 0, z = 0;

		this.intersections.forEach( intersection => {

			x += intersection.position.x;

			y += intersection.position.y;

			z += intersection.position.z;

		} );

		const count = this.intersections.size;

		return new Vector3( x / count, y / count, z / count );
	}

	getSplines () {

		return Array.from( this.splines );

	}

	getIntersectionCount (): number {

		return this.intersections.size;

	}

	hasSpline ( spline: AbstractSpline ) {

		return this.splines.has( spline );

	}

	getOffset ( spline: AbstractSpline ) {

		let sStart = Number.MAX_VALUE;
		let sEnd = Number.MIN_VALUE;

		this.intersections.forEach( intersection => {

			if ( intersection.spline === spline ) {

				if ( intersection.splineStart < sStart ) {
					sStart = intersection.splineStart;
				}

				if ( intersection.splineEnd > sEnd ) {
					sEnd = intersection.splineEnd;
				}

			}

			if ( intersection.otherSpline === spline ) {

				if ( intersection.otherStart < sStart ) {
					sStart = intersection.otherStart;
				}

				if ( intersection.otherEnd > sEnd ) {
					sEnd = intersection.otherEnd;
				}

			}

		} );

		return { sStart, sEnd };
	}

	merge ( otherGroup: IntersectionGroup ) {

		otherGroup.intersections.forEach( intersection => {

			this.addSplineIntersection( intersection );

		} );

	}

	toString () {

		const splines = Array.from( this.splines ).map( s => s.id ).join( ',' );

		return `IntersectionGroup: ${ this.intersections.size } Splines:${ splines } Center:${ this.centroid.x.toFixed( 2 ) },${ this.centroid.y.toFixed( 2 ) }`;

	}
}
