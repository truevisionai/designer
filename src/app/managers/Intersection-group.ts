/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { SplineIntersection } from 'app/services/junction/spline-intersection';
import { Vector3 } from "three";

export class IntersectionGroup {


	/**
	 * Positions of intersections in this group
	 */
	private intersections: SplineIntersection[] = [];

	/**
	 * Unique splines involved in the intersections of this group
	 */
	private splines: Set<AbstractSpline> = new Set();

	constructor ( i: SplineIntersection ) {

		this.addSplineIntersection( i );

	}

	addSplineIntersection ( i: SplineIntersection ) {

		this.intersections.push( i );

		this.splines.add( i.spline );

		this.splines.add( i.otherSpline );

	}

	/**
	 * Calculates the centroid of the intersections as the representative position
	 * @returns Vector3
	 */
	getRepresentativePosition (): Vector3 {

		let x = 0, y = 0, z = 0;

		this.intersections.forEach( intersection => {

			x += intersection.position.x;

			y += intersection.position.y;

			z += intersection.position.z;

		} );

		const count = this.intersections.length;

		return new Vector3( x / count, y / count, z / count );
	}

	getSplines () {

		return Array.from( this.splines );

	}

	getApproachingAngle ( spline: AbstractSpline ) {

		const intersection = this.intersections.find( i => i.spline === spline );

		if ( intersection ) {

			return intersection.angle;

		}

		return 0;
	}

}
