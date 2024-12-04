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

	findIntersections ( spline: AbstractSpline, otherSplines: any = null ): SplineIntersection[] {

		if ( spline.controlPoints.length < 2 ) return [];

		const splines = otherSplines || this.mapService.nonJunctionSplines;

		const intersections: SplineIntersection[] = [];

		for ( const otherSpline of splines ) {

			if ( spline.equals( otherSpline ) ) continue;
			if ( spline.isLinkedTo( otherSpline ) ) continue;

			findIntersectionsViaBox2D( spline, otherSpline ).forEach( intersection => {
				intersections.push( intersection );
			} );

		}

		return intersections;

	}

}


// eslint-disable-next-line max-lines-per-function
export function findIntersectionsViaBox2D ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize: number = 1 ): SplineIntersection[] | null {

	const intersections: SplineIntersection[] = [];

	if ( splineA.equals( splineB ) ) return intersections;

	if ( !splineA.boundingBox.intersectsBox( splineB.boundingBox ) ) return intersections;

	const currentIntersectionBox = new Box2(); // To track the intersection area

	let isIntersecting = false;

	for ( let i = 0; i < splineA.centerPoints.length - 1; i++ ) {

		let currentIntersection = false;

		const boxA = splineA.createBoundingBoxAt( i, stepSize );

		if ( !boxA ) continue;

		for ( let j = 0; j < splineB.centerPoints.length - 1; j++ ) {

			const boxB = splineB.createBoundingBoxAt( j, stepSize );

			if ( !boxB ) continue;

			// Check if these boxes intersect
			if ( boxA.intersectsBox( boxB ) ) {

				if ( !splineA.isHeightMatching( i, splineB, j ) ) continue;

				const intersection = boxA.clone().intersect( boxB );

				if ( !isIntersecting ) {

					currentIntersectionBox.copy( intersection );

				} else {

					currentIntersectionBox.union( intersection );

				}

				isIntersecting = true;

				currentIntersection = true;

			}

		}

		if ( isIntersecting && !currentIntersection ) {

			const average = getAveragePoint( currentIntersectionBox )
			const center = new Vector3( average.x, average.y, 0 );
			const intersection = new SplineIntersection( splineA, splineB, center );

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

	const splineStart = Math.max( aMin.s - BUFFER, 0 );
	const splineEnd = Math.min( aMax.s + BUFFER, intersection.spline.getLength() );

	const otherStart = Math.max( bMin.s - BUFFER, 0 );
	const otherEnd = Math.min( bMax.s + BUFFER, intersection.otherSpline.getLength() );

	// TEMP: hack to fix the offset issue at ends

	// if ( otherStart == 0 ) {
	// 	otherEnd += 5;
	// }

	// if ( splineStart == 0 ) {
	// 	splineEnd += 5;
	// }

	// if ( otherEnd == intersection.otherSpline.getLength() ) {
	// 	otherStart -= 5;
	// }

	// if ( splineEnd == intersection.spline.getLength() ) {
	// 	splineStart -= 5;
	// }

	intersection.addSection( intersection.spline, splineStart, splineEnd );
	intersection.addSection( intersection.otherSpline, otherStart, otherEnd );

}
