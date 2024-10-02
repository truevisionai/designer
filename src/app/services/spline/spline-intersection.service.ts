/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Vector3, Vector2, Box2 } from 'three';
import { SplineIntersection } from '../junction/spline-intersection';
import { MapService } from '../map/map.service';

@Injectable( {
	providedIn: 'root'
} )
export class SplineIntersectionService {

	constructor (
		private mapService: MapService
	) { }

	findIntersections ( spline: AbstractSpline, otherSplines = null ): SplineIntersection[] {

		if ( spline.controlPoints.length < 2 ) return [];

		const splines = otherSplines || this.mapService.nonJunctionSplines;
		const splineCount = splines.length;

		const successorSpline = spline.getSuccessorSpline();
		const predecessorSpline = spline.getPredecessorSpline();

		const intersections: SplineIntersection[] = [];

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			// NOTE: ignore pre or successor splines
			// MAY NEED TO FIND BETTER OPTION
			if ( otherSpline == spline ) continue;
			if ( otherSpline == successorSpline ) continue;
			if ( otherSpline == predecessorSpline ) continue;

			findIntersectionsViaBox2D( spline, otherSpline ).forEach( intersection => {
				intersections.push( intersection );
			} );
		}

		return intersections;

	}

}


// eslint-disable-next-line max-lines-per-function
export function findIntersectionsViaBox2D ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): SplineIntersection[] | null {

	let intersections: SplineIntersection[] = [];
	let startPoint: Vector2 = null;
	let endPoint: Vector2 = null;
	let isIntersecting = false;
	let currentIntersectionBox = new Box2(); // To track the intersection area

	if ( splineA == splineB ) return intersections;

	if ( !splineA.boundingBox.intersectsBox( splineB.boundingBox ) ) return intersections;

	for ( let i = 0; i < splineA.centerPoints.length - 1; i++ ) {

		let currentIntersection = false;

		const aLeftStart = splineA.leftPoints[ i ];
		const aRightStart = splineA.rightPoints[ i ];
		const aLeftEnd = splineA.leftPoints[ i + 1 ];
		const aRightEnd = splineA.rightPoints[ i + 1 ];

		if ( !aLeftStart || !aRightStart || !aLeftEnd || !aRightEnd ) continue;

		for ( let j = 0; j < splineB.centerPoints.length - 1; j++ ) {

			const bLeftStart = splineB.leftPoints[ j ];
			const bRightStart = splineB.rightPoints[ j ];
			const bLeftEnd = splineB.leftPoints[ j + 1 ];
			const bRightEnd = splineB.rightPoints[ j + 1 ];

			if ( !bLeftStart || !bRightStart || !bLeftEnd || !bRightEnd ) continue;

			// Create boxes for each segment using left and right points
			const boxA = createBoxFromSegment( aLeftStart.position, aRightStart.position, aLeftEnd.position, aRightEnd.position );
			const boxB = createBoxFromSegment( bLeftStart.position, bRightStart.position, bLeftEnd.position, bRightEnd.position );

			// Check if these boxes intersect
			if ( boxA.intersectsBox( boxB ) ) {

				const intersection = boxA.clone().intersect( boxB );

				if ( !isIntersecting ) {

					startPoint = getAveragePoint( intersection );

					currentIntersectionBox.copy( intersection );

				} else {

					currentIntersectionBox.union( intersection );

				}

				endPoint = getAveragePoint( intersection );

				isIntersecting = true;

				currentIntersection = true;

			}

		}

		if ( isIntersecting && !currentIntersection ) {

			const average = getAveragePoint( currentIntersectionBox )
			const center = new Vector3( average.x, average.y, 0 );
			const intersection = new SplineIntersection( splineA, splineB, center );

			intersection.start = startPoint;
			intersection.end = endPoint;
			intersection.area = currentIntersectionBox.clone();

			intersections.push( intersection );

			isIntersecting = false; // Reset intersection tracking

			currentIntersectionBox.makeEmpty(); // Reset the intersection box

		}

	}

	if ( isIntersecting ) {

		const average = getAveragePoint( currentIntersectionBox )
		const center = new Vector3( average.x, average.y, 0 );
		const intersection = new SplineIntersection( splineA, splineB, center );

		intersection.start = startPoint;
		intersection.end = endPoint;
		intersection.area = currentIntersectionBox.clone();

		intersections.push( intersection );

	}

	intersections.forEach( intersection => computeOffsets( intersection ) );

	return intersections;
}

function getAveragePoint ( box: Box2 ): Vector2 {
	const center = box.getCenter( new Vector2() );
	return new Vector2( center.x, center.y );
}

function createBoxFromSegment ( leftStart: Vector3, rightStart: Vector3, leftEnd: Vector3, rightEnd: Vector3 ): Box2 {

	// Use the left and right points to directly define the box boundaries
	const points = [
		new Vector2( leftStart.x, leftStart.y ),
		new Vector2( rightStart.x, rightStart.y ),
		new Vector2( leftEnd.x, leftEnd.y ),
		new Vector2( rightEnd.x, rightEnd.y )
	];

	// Create a Box2 that bounds the road segment
	return new Box2().setFromPoints( points );
}


// eslint-disable-next-line max-lines-per-function
function computeOffsets ( intersection: SplineIntersection ): void {

	const BUFFER = 2;

	const corners = [
		new Vector3( intersection.area.min.x, intersection.area.min.y, 0 ),
		new Vector3( intersection.area.max.x, intersection.area.min.y, 0 ),
		new Vector3( intersection.area.max.x, intersection.area.max.y, 0 ),
		new Vector3( intersection.area.min.x, intersection.area.max.y, 0 )
	];

	const splineACoords = corners.map( corner => intersection.spline.getCoordAtPosition( corner ) ).sort( ( a, b ) => a.s - b.s );
	const splineBCoords = corners.map( corner => intersection.otherSpline.getCoordAtPosition( corner ) ).sort( ( a, b ) => a.s - b.s );

	const aMin = splineACoords[ 0 ];
	const aMax = splineACoords[ splineACoords.length - 1 ];

	const bMin = splineBCoords[ 0 ];
	const bMax = splineBCoords[ splineBCoords.length - 1 ];

	intersection.splineStart = Math.max( aMin.s - BUFFER, 0 );
	intersection.splineEnd = Math.min( aMax.s + BUFFER, intersection.spline.getLength() );

	intersection.otherStart = Math.max( bMin.s - BUFFER, 0 );
	intersection.otherEnd = Math.min( bMax.s + BUFFER, intersection.otherSpline.getLength() );

	// TEMP: hack to fix the offset issue at ends

	if ( intersection.otherStart == 0 ) {
		intersection.otherEnd += 5;
	}

	if ( intersection.splineStart == 0 ) {
		intersection.splineEnd += 5;
	}

	if ( intersection.otherEnd == intersection.otherSpline.getLength() ) {
		intersection.otherStart -= 5;
	}

	if ( intersection.splineEnd == intersection.spline.getLength() ) {
		intersection.splineStart -= 5;
	}
}
