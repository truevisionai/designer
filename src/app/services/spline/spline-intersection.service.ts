import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Maths } from 'app/utils/maths';
import { Vector3, Box3, Vector2, Box2 } from 'three';
import { SplineIntersection } from '../junction/spline-intersection';
import { RoadWidthService } from '../road/road-width.service';
import { MapService } from '../map/map.service';
import { SplinePositionService } from './spline-position.service';

@Injectable( {
	providedIn: 'root'
} )
export class SplineIntersectionService {

	constructor (
		private mapService: MapService,
		private splinePositionService: SplinePositionService,
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

			// const intersection = this.getSplineIntersectionPoint( spline, otherSpline );
			// const intersection = this.findClosestIntersection( spline, otherSpline );
			// const intersection = this.getSplineIntersectionPointViaBoundsv2( spline, otherSpline );
			// if ( !intersection ) continue;

			this.findIntersectionsViaBox2D( spline, otherSpline ).forEach( intersection => {
				intersections.push( intersection );
			} );
		}

		return intersections;

	}

	findIntersection ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const pointsA = this.splinePositionService.getPoints( splineA, stepSize )
		const pointsB = this.splinePositionService.getPoints( splineB, stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ];
				const b = pointsA[ i + 1 ];
				const c = pointsB[ j ];
				const d = pointsB[ j + 1 ];

				const distance = a.distanceTo( c );

				if ( distance <= stepSize * 2 ) {

					return Maths.findLineIntersection( a, b, c, d );

				}

			}

		}

	}

	findIntersectionByBounds ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): SplineIntersection | null {

		function createBoundingBoxForSegment ( start: Vector3, end: Vector3, roadWidth: number ): Box3 {

			const box = new Box3();

			box.setFromCenterAndSize( start.clone().add( end ).multiplyScalar( 0.5 ), new Vector3( roadWidth, roadWidth, Math.abs( start.z - end.z ) ) );

			return box;

		}

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		for ( let i = 0; i < splineA.waypoints.length - 1; i++ ) {

			for ( let j = 0; j < splineB.waypoints.length - 1; j++ ) {

				const a = splineA.waypoints[ i ];
				const b = splineA.waypoints[ i + 1 ];
				const c = splineB.waypoints[ j ];
				const d = splineB.waypoints[ j + 1 ];

				const roadWidthA = a.userData.width;
				const roadWidthB = c.userData.width;

				// Create bounding boxes for the line segments
				const boxA = createBoundingBoxForSegment( a.position, b.position, roadWidthA );
				const boxB = createBoundingBoxForSegment( c.position, d.position, roadWidthB );

				// Check if these bounding boxes intersect
				if ( !this.intersectsBox( boxA, boxB ) ) continue;

				const intersectionPoint = Maths.findLineIntersection( a.position, b.position, c.position, d.position );

				if ( intersectionPoint ) {

					const angle = Maths.findLineIntersectionAngle( a.position, b.position, c.position, d.position );

					return new SplineIntersection( splineA, splineB, intersectionPoint, angle );
				}

			}

		}

	}

	findIntersectionsViaBox2D ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): SplineIntersection[] | null {

		let intersections: SplineIntersection[] = [];
		let startPoint: Vector2 = null;
		let endPoint: Vector2 = null;
		let isIntersecting = false;
		let currentIntersectionBox = new Box2(); // To track the intersection area

		function getAveragePoint ( box: Box2 ) {
			const center = box.getCenter( new Vector2() );
			return new Vector2( center.x, center.y );
		}

		function createBoxFromSegment ( leftStart: Vector3, rightStart: Vector3, leftEnd: Vector3, rightEnd: Vector3 ) {
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

		intersections.forEach( intersection => this.computeOffsets( intersection ) );

		return intersections;
	}

	computeOffsets ( intersection: SplineIntersection ) {

		// DebugDrawService.instance.drawBox2D( intersection.area );
		// DebugDrawService.instance.drawSphere( intersection.position );

		const BUFFER = 2;

		const corners = [
			new Vector3( intersection.area.min.x, intersection.area.min.y, 0 ),
			new Vector3( intersection.area.max.x, intersection.area.min.y, 0 ),
			new Vector3( intersection.area.max.x, intersection.area.max.y, 0 ),
			new Vector3( intersection.area.min.x, intersection.area.max.y, 0 )
		];

		const splineACoords = corners.map( corner => this.splinePositionService.getCoordAt( intersection.spline, corner ) ).sort( ( a, b ) => a.s - b.s );
		const splineBCoords = corners.map( corner => this.splinePositionService.getCoordAt( intersection.otherSpline, corner ) ).sort( ( a, b ) => a.s - b.s );

		const aMin = splineACoords[ 0 ];
		const aMax = splineACoords[ splineACoords.length - 1 ];

		const bMin = splineBCoords[ 0 ];
		const bMax = splineBCoords[ splineBCoords.length - 1 ];

		// DebugDrawService.instance.drawLine( [ aMin.position, aMax.position ], 0xff0000 );
		// DebugDrawService.instance.drawLine( [ bMin.position, bMax.position ], 0x0000ff );

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

	findClosestIntersection ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): SplineIntersection | null {

		function createBoundingBoxForSegment ( start: Vector3, end: Vector3, roadWidth: number ): Box3 {

			const box = new Box3();

			box.setFromCenterAndSize( start.clone().add( end ).multiplyScalar( 0.5 ), new Vector3( roadWidth, roadWidth, Math.abs( start.z - end.z ) ) );

			return box;

		}

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const pointsA = this.splinePositionService.getPoints( splineA, stepSize );
		const pointsB = this.splinePositionService.getPoints( splineB, stepSize );

		let currentDistance = Number.MAX_VALUE;
		let closestLeftIndex = 0;
		let closestRightIndex = 0;

		for ( let i = 0; i < pointsA.length; i++ ) {

			for ( let j = 0; j < pointsB.length; j++ ) {

				const distance = pointsA[ i ].distanceTo( pointsB[ j ] );

				if ( distance < currentDistance ) {
					currentDistance = distance;
					closestLeftIndex = i;
					closestRightIndex = j;
				}
			}
		}

		let angle = 0;

		if (
			closestLeftIndex < pointsA.length - 1 &&
			closestRightIndex < pointsB.length - 1
		) {

			angle = Maths.findLineIntersectionAngle( pointsA[ closestLeftIndex ], pointsA[ closestLeftIndex + 1 ], pointsB[ closestRightIndex ], pointsB[ closestRightIndex + 1 ] )

			// const roadWidthA = this.getWidthAt( splineA, pointsA[ closestLeftIndex ], closestLeftIndex * stepSize );
			// const roadWidthB = this.getWidthAt( splineB, pointsB[ closestRightIndex ], closestRightIndex * stepSize );

			// // Create bounding boxes for the line segments
			// const boxA = createBoundingBoxForSegment( pointsA[ closestLeftIndex ], pointsA[ closestLeftIndex + 1 ], roadWidthA );
			// const boxB = createBoundingBoxForSegment( pointsB[ closestRightIndex ], pointsB[ closestRightIndex + 1 ], roadWidthB );

			// // Check if these bounding boxes intersect
			// if ( !this.intersectsBox( boxA, boxB ) ) return;
		}


		return new SplineIntersection( splineA, splineB, pointsA[ closestLeftIndex ], 0 );
	}

	findIntersectionByBoundv2 ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const segmentsA = splineA.segmentMap.toArray();
		const segmentsB = splineA.segmentMap.toArray();

		for ( let i = 0; i < segmentsA.length; i++ ) {

			const segmentA = segmentsA[ i ];

			if ( !( segmentA instanceof TvRoad ) ) continue;

			for ( let j = 0; j < segmentsB.length; j++ ) {

				const segmentB = segmentsB[ j ];

				if ( !( segmentB instanceof TvRoad ) ) continue;

				const roadA = segmentA;
				const roadB = segmentB;

				const intersection = this.findRoadIntersectionByBound( roadA, roadB, stepSize );

				if ( intersection ) return intersection;

			}

		}

	}

	findRoadIntersectionByBound ( roadA: TvRoad, roadB: TvRoad, stepSize = 1, thresholdDistance = 1 ): Vector3 | null {

		if ( roadA.id == roadB.id ) return;

		if ( !this.intersectsRoadBox( roadA, roadB ) ) return;

		for ( let i = 0; i < roadA.length; i += stepSize ) {

			const posThetaA = roadA.getPosThetaAt( i );

			const widthA = ( posThetaA.t > 0 ? RoadWidthService.instance.findLeftWidthAt( roadA, posThetaA.s ) : RoadWidthService.instance.findRightWidthAt( roadA, posThetaA.s ) ) / 2;

			for ( let j = 0; j < roadB.length; j += stepSize ) {

				const posThetaB = roadB.getPosThetaAt( j );

				const widthB = ( posThetaB.t > 0 ? RoadWidthService.instance.findLeftWidthAt( roadB, posThetaB.s ) : RoadWidthService.instance.findRightWidthAt( roadB, posThetaB.s ) ) / 2;

				// Calculate the distance between points on roadA and roadB
				const distance = Math.sqrt( Math.pow( posThetaA.x - posThetaB.x, 2 ) + Math.pow( posThetaA.y - posThetaB.y, 2 ) + Math.pow( posThetaA.z - posThetaB.z, 2 ) );

				// Adjust the threshold distance by the widths of the roads
				const totalWidth = widthA + widthB;

				const adjustedThreshold = thresholdDistance + totalWidth;

				// If distance is within the adjusted threshold, we consider it an intersection
				if ( distance <= adjustedThreshold ) {
					return new Vector3( posThetaA.x, posThetaA.y, posThetaA.z ); // or return any relevant intersection point details
				}
			}
		}

	}

	private intersectsRoadBox ( roadA: TvRoad, roadB: TvRoad ): boolean {

		if ( !roadA.boundingBox ) roadA.computeBoundingBox();
		if ( !roadB.boundingBox ) roadB.computeBoundingBox();

		return this.intersectsBox( roadA.boundingBox, roadB.boundingBox );

	}

	private intersectsSplineBox ( splineA: AbstractSpline, splineB: AbstractSpline ): boolean {

		return this.intersectsBox( splineA.depBoundingBox, splineB.depBoundingBox );

	}

	private intersectsBox ( boxA: Box3, boxB: Box3 ): boolean {

		// return true if we box is not generated
		if ( !boxA || !boxB ) return true;

		const boxIntersection = boxA.intersectsBox( boxB );

		return boxIntersection;

	}


}
