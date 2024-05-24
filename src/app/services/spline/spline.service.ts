/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from '../map/map.service';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { MapEvents } from 'app/events/map-events';
import { SplineUpdatedEvent } from 'app/events/spline/spline-updated-event';
import { SplineCreatedEvent } from 'app/events/spline/spline-created-event';
import { SplineRemovedEvent } from 'app/events/spline/spline-removed-event';
import { BaseDataService } from '../../core/interfaces/data.service';
import { Box3, Vector3 } from 'three';
import { Maths } from 'app/utils/maths';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SplineIntersection } from '../junction/spline-intersection';
import { SplineSegmentService } from './spline-segment.service';

@Injectable( {
	providedIn: 'root'
} )
export class SplineService extends BaseDataService<AbstractSpline> {
	constructor (
		private mapService: MapService,
		private segmentService: SplineSegmentService,
	) {
		super();
	}

	all (): AbstractSpline[] {

		return this.mapService.splines;

	}

	add ( spline: AbstractSpline ) {

		this.mapService.map.addSpline( spline );

		MapEvents.splineCreated.emit( new SplineCreatedEvent( spline ) );

	}

	remove ( spline: AbstractSpline ) {

		MapEvents.splineRemoved.emit( new SplineRemovedEvent( spline ) );

		this.mapService.map.removeSpline( spline );

	}

	update ( spline: AbstractSpline ): void {

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( spline ) );

	}

	findIntersections ( spline: AbstractSpline ): SplineIntersection[] {

		const splines = this.mapService.nonJunctionSplines;
		const splineCount = splines.length;

		const successorSpline = spline.getSuccessorSpline();
		const predecessorSpline = spline.getPredecessorrSpline();

		const intersections: SplineIntersection[] = [];

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			// NOTE: ignore pre or successor splines
			// MAY NEED TO FIND BETTER OPTION
			if ( otherSpline == spline ) continue;
			if ( otherSpline == successorSpline ) continue;
			if ( otherSpline == predecessorSpline ) continue;

			// const intersection = this.getSplineIntersectionPoint( spline, otherSpline );
			const intersection = this.findIntersectionByBounds( spline, otherSpline );
			// const intersection = this.getSplineIntersectionPointViaBoundsv2( spline, otherSpline );

			if ( !intersection ) continue;

			intersections.push( intersection );
		}

		return intersections;

	}


	findIntersection ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const pointsA = splineA.getPoints( stepSize )
		const pointsB = splineB.getPoints( stepSize );

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

		const pointsA = splineA.getPoints( stepSize )
		const pointsB = splineB.getPoints( stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ];
				const b = pointsA[ i + 1 ];
				const c = pointsB[ j ];
				const d = pointsB[ j + 1 ];

				const roadWidthA = this.segmentService.getWidthAt( splineA, a, i * stepSize );
				const roadWidthB = this.segmentService.getWidthAt( splineB, c, j * stepSize );

				// Create bounding boxes for the line segments
				const boxA = createBoundingBoxForSegment( a, b, roadWidthA );
				const boxB = createBoundingBoxForSegment( c, d, roadWidthB );

				// Check if these bounding boxes intersect
				if ( !this.intersectsBox( boxA, boxB ) ) continue;

				const intersectionPoint = Maths.findLineIntersection( a, b, c, d );

				if ( intersectionPoint ) {

					const angle = Maths.findLineIntersectionAngle( a, b, c, d );

					return new SplineIntersection( splineA, splineB, intersectionPoint, angle );
				}

			}

		}

	}

	findIntersectionByBoundv2 ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const segmentsA = splineA.getSplineSegments();
		const segmentsB = splineB.getSplineSegments();

		for ( let i = 0; i < segmentsA.length; i++ ) {

			const segmentA = segmentsA[ i ];

			if ( !segmentA.isRoad ) continue;

			for ( let j = 0; j < segmentsB.length; j++ ) {

				const segmentB = segmentsB[ j ];

				if ( !segmentB.isRoad ) continue;

				const roadA = segmentA.getInstance<TvRoad>();
				const roadB = segmentB.getInstance<TvRoad>();

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

			const widthA = ( posThetaA.t > 0 ? roadA.getLeftSideWidth( posThetaA.s ) : roadA.getRightsideWidth( posThetaA.s ) ) / 2;

			for ( let j = 0; j < roadB.length; j += stepSize ) {

				const posThetaB = roadB.getPosThetaAt( j );

				const widthB = ( posThetaB.t > 0 ? roadB.getLeftSideWidth( posThetaB.s ) : roadB.getRightsideWidth( posThetaB.s ) ) / 2;

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

		return this.intersectsBox( splineA.boundingBox, splineB.boundingBox );

	}

	private intersectsBox ( boxA: Box3, boxB: Box3 ): boolean {

		// return true if we box is not generated
		if ( !boxA || !boxB ) return true;

		const boxIntersection = boxA.intersectsBox( boxB );

		return boxIntersection;

	}
}
