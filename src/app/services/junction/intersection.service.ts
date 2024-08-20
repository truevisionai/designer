/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvContactPoint } from 'app/map/models/tv-common';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Box3, Vector3 } from 'three';
import { JunctionService } from './junction.service';
import { MapService } from '../map/map.service';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { RoadDividerService } from "../road/road-divider.service";
import { DepConnectionFactory } from 'app/map/junction/dep-connection.factory';
import { SplineService } from "../spline/spline.service";

export class SplineIntersection {
	spline: AbstractSpline;
	otherSpline: AbstractSpline;
	intersection: Vector3
}

/**
 * @deprecated
 */
@Injectable( {
	providedIn: 'root'
} )
export class IntersectionService {

	constructor (
		private mapService: MapService,
		private junctionService: JunctionService,
		private junctionConnectionService: DepConnectionFactory,
		private roadDividerService: RoadDividerService,
		private splineService: SplineService,
	) {
	}

	getRoadIntersectionPoint ( roadA: TvRoad, roadB: TvRoad, stepSize = 1 ): Vector3 | null {

		if ( roadA.id == roadB.id ) return;

		if ( !this.intersectsRoadBox( roadA, roadB ) ) return;

		const pointsA = roadA.getReferenceLinePoints( stepSize );
		const pointsB = roadB.getReferenceLinePoints( stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ].position;
				const b = pointsA[ i + 1 ].position;
				const c = pointsB[ j ].position;
				const d = pointsB[ j + 1 ].position;

				const distance = a.distanceTo( c );

				if ( distance < stepSize ) {

					return this.lineIntersection( a, b, c, d );

				}

			}

		}

	}

	getSplineIntersectionPoint ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		// const pointsA = splineA.getPoints( stepSize )
		// const pointsB = splineB.getPoints( stepSize );

		// for ( let i = 0; i < pointsA.length - 1; i++ ) {
		//
		// 	for ( let j = 0; j < pointsB.length - 1; j++ ) {
		//
		// 		const a = pointsA[ i ];
		// 		const b = pointsA[ i + 1 ];
		// 		const c = pointsB[ j ];
		// 		const d = pointsB[ j + 1 ];
		//
		// 		const distance = a.distanceTo( c );
		//
		// 		if ( distance <= stepSize * 2 ) {
		//
		// 			return this.lineIntersection( a, b, c, d );
		//
		// 		}
		//
		// 	}
		//
		// }

	}

	getSplineIntersectionPointViaBounds ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		function createBoundingBoxForSegment ( start: Vector3, end: Vector3, roadWidth: number ): Box3 {

			const box = new Box3();

			box.setFromCenterAndSize( start.clone().add( end ).multiplyScalar( 0.5 ), new Vector3( roadWidth, roadWidth, Math.abs( start.z - end.z ) ) );

			return box;

		}

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		// const pointsA = splineA.getPoints( stepSize )
		// const pointsB = splineB.getPoints( stepSize );

		// for ( let i = 0; i < pointsA.length - 1; i++ ) {
		//
		// 	for ( let j = 0; j < pointsB.length - 1; j++ ) {
		//
		// 		const a = pointsA[ i ];
		// 		const b = pointsA[ i + 1 ];
		// 		const c = pointsB[ j ];
		// 		const d = pointsB[ j + 1 ];
		//
		// 		const roadWidthA = this.splineService.getWidthAt( splineA, a, i * stepSize );
		// 		const roadWidthB = this.splineService.getWidthAt( splineB, c, j * stepSize );
		//
		// 		// Create bounding boxes for the line segments
		// 		const boxA = createBoundingBoxForSegment( a, b, roadWidthA );
		// 		const boxB = createBoundingBoxForSegment( c, d, roadWidthB );
		//
		// 		// Check if these bounding boxes intersect
		// 		if ( !this.intersectsBox( boxA, boxB ) ) continue;
		//
		// 		const intersectionPoint = this.lineIntersection( a, b, c, d );
		//
		// 		if ( intersectionPoint ) {
		// 			return intersectionPoint;
		// 		}
		//
		// 	}
		//
		// }

	}

	// getSplineIntersectionPointViaBoundsv2 ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {
	//
	// 	if ( splineA == splineB ) return;
	//
	// 	if ( !this.intersectsSplineBox( splineA, splineB ) ) return;
	//
	// 	const segmentsA = splineA.getSplineSegments();
	// 	const segmentsB = splineB.getSplineSegments();
	//
	// 	for ( let i = 0; i < segmentsA.length; i++ ) {
	//
	// 		const segmentA = segmentsA[ i ];
	//
	// 		if ( !segmentA.isRoad ) continue;
	//
	// 		for ( let j = 0; j < segmentsB.length; j++ ) {
	//
	// 			const segmentB = segmentsB[ j ];
	//
	// 			if ( !segmentB.isRoad ) continue;
	//
	// 			const roadA = segmentA.getInstance<TvRoad>();
	// 			const roadB = segmentB.getInstance<TvRoad>();
	//
	// 			const intersection = this.getRoadIntersectionByBounds( roadA, roadB, stepSize );
	//
	// 			if ( intersection ) return intersection;
	//
	// 		}
	//
	// 	}
	//
	//
	// }

	checkSplineIntersections ( spline: AbstractSpline ) {

		const splines = this.mapService.nonJunctionSplines;
		const splineCount = splines.length;

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			const intersection = this.getSplineIntersectionPoint( spline, otherSpline );

			if ( !intersection ) continue;

			// const junction = this.createJunction( spline, otherSpline, intersection );
			//
			// if ( !junction ) continue;
			//
			// this.junctionService.addJunction( junction );

		}

	}

	// getSplineIntersections ( spline: AbstractSpline ): SplineIntersection[] {
	//
	// 	const splines = this.mapService.nonJunctionSplines;
	// 	const splineCount = splines.length;
	//
	// 	const successorSpline = spline.getSuccessorSpline();
	// 	const predecessorSpline = spline.getPredecessorrSpline();
	//
	// 	const intersections = [];
	//
	// 	for ( let i = 0; i < splineCount; i++ ) {
	//
	// 		const otherSpline = splines[ i ];
	//
	// 		// NOTE: ignore pre or successor splines
	// 		// MAY NEED TO FIND BETTER OPTION
	// 		if ( otherSpline == successorSpline ) continue;
	// 		if ( otherSpline == predecessorSpline ) continue;
	//
	// 		// const intersection = this.getSplineIntersectionPoint( spline, otherSpline );
	// 		const intersection = this.getSplineIntersectionPointViaBounds( spline, otherSpline );
	// 		// const intersection = this.getSplineIntersectionPointViaBoundsv2( spline, otherSpline );
	//
	// 		if ( !intersection ) continue;
	//
	// 		intersections.push( {
	// 			spline: spline,
	// 			otherSpline: otherSpline,
	// 			intersection: intersection
	// 		} );
	// 	}
	//
	// 	return intersections;
	// }

	createJunction ( splineA: AbstractSpline, splineB: AbstractSpline, point: Vector3 ) {

		if ( splineA == splineB ) return;

		// const splineCoordA = splineA.getCoordAt( point );
		// const splineCoordB = splineB.getCoordAt( point );
		//
		// const segmentA = splineA.getSegmentAt( splineCoordA.s );
		// const segmentB = splineB.getSegmentAt( splineCoordB.s );

		// if ( !segmentA ) console.error( 'segmentA is null', splineA, splineCoordA );
		// if ( !segmentB ) console.error( 'segmentB is null', splineB, splineCoordB );
		//
		// if ( !segmentA || !( segmentA instanceof TvRoad ) ) {
		// 	return
		// }
		//
		// if ( !segmentB || !( segmentB instanceof TvRoad ) ) {
		// 	return
		// }
		//
		// const roadA = segmentA;
		// const roadB = segmentB;
		//
		// if ( !roadA || !roadB ) {
		// 	return;
		// }

		// const coordA = roadA.getPosThetaByPosition( point ).toRoadCoord( roadA );
		// const coordB = roadB.getPosThetaByPosition( point ).toRoadCoord( roadB );
		//
		// const junction = this.internal_createIntersectionFromCoords( coordA, coordB );
		//
		// return junction;

	}

	postProcessJunction ( junction: TvJunction ) {

		this.junctionConnectionService.postProcessJunction( junction );

	}

	createIntersectionByContact (
		coordA: TvRoadCoord,
		contactA: TvContactPoint,
		coordB: TvRoadCoord,
		contactB: TvContactPoint
	): TvJunction {

		// roads should be different
		if ( coordA.road === coordB.road ) {

			const junction = this.junctionService.createNewJunction();

			const coord = coordA.s > coordB.s ? coordA : coordB;

			const roadCCoord = this.cutRoadForJunction( coord, junction );

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				TvContactPoint.END,
				roadCCoord.road,
				TvContactPoint.START
			);

			this.postProcessJunction( junction );

			return junction;

		}

		// could be usefull to calculcating if we need
		// to add junction into the roads
		// const distance = coordA.distanceTo( coordB );

		if ( coordA.contact == contactA && coordB.contact == contactB ) {

			const junction = this.junctionService.createNewJunction();

			this.internal_addConnections( junction, coordA, coordB, null, null );

			this.postProcessJunction( junction );

			return junction;

		}

	}

	addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord ) {

		this.junctionService.addConnectionsFromContact(
			junction,
			coordA.road,
			coordA.contact,
			coordB.road,
			coordB.contact
		);

	}

	private intersectsRoadBox ( roadA: TvRoad, roadB: TvRoad ): boolean {

		if ( !roadA.boundingBox ) roadA.computeBoundingBox();
		if ( !roadB.boundingBox ) roadB.computeBoundingBox();

		return this.intersectsBox( roadA.boundingBox, roadB.boundingBox );

	}

	private intersectsSplineBox ( splineA: AbstractSpline, splineB: AbstractSpline ): boolean {

		return false;
		// return this.intersectsBox( splineA.boundingBox, splineB.boundingBox );

	}

	private intersectsBox ( boxA: Box3, boxB: Box3 ): boolean {

		// return true if we box is not generated
		if ( !boxA || !boxB ) return true;

		const boxIntersection = boxA.intersectsBox( boxB );

		return boxIntersection;

	}

	private lineIntersection ( a: Vector3, b: Vector3, c: Vector3, d: Vector3 ): Vector3 | null {

		// Direction vectors for the lines
		const dir1 = b.clone().sub( a );
		const dir2 = d.clone().sub( c );

		// Vector from a to c
		const ac = c.clone().sub( a );

		// Check if lines are parallel (cross product is zero)
		const crossDir1Dir2 = dir1.clone().cross( dir2 );
		if ( crossDir1Dir2.lengthSq() === 0 ) return null; // Lines are parallel

		// Compute the parameters t and s
		const t = ( ac.clone().cross( dir2 ).dot( crossDir1Dir2 ) ) / crossDir1Dir2.lengthSq();
		const s = ( ac.clone().cross( dir1 ).dot( crossDir1Dir2 ) ) / crossDir1Dir2.lengthSq();

		// Compute the closest points on the lines
		const closestPtOnLine1 = a.clone().add( dir1.multiplyScalar( t ) );
		const closestPtOnLine2 = c.clone().add( dir2.multiplyScalar( s ) );

		// Check if the closest points are the same (within a small tolerance)
		if ( closestPtOnLine1.distanceTo( closestPtOnLine2 ) < 1e-6 ) {
			return closestPtOnLine1; // Intersection point
		}

		return null; // Lines do not intersect

	}

	cutRoadForJunction ( coord: TvRoadCoord, junction: TvJunction ): TvRoadCoord {

		throw new Error( 'Method not implemented.' );

	}

	private internal_createIntersectionFromCoords ( coordA: TvRoadCoord, coordB: TvRoadCoord ): TvJunction {

		const junction = this.junctionService.createNewJunction();

		const [ coordC, coordD ] = this.createNewSegments( junction, coordA, coordB );

		this.internal_addConnections( junction, coordA, coordB, coordC?.road, coordD?.road );

		// this.postProcessJunction( junction );

		return junction;

	}

	createNewSegments ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord ): TvRoadCoord[] {

		const roadC = this.cutRoadForJunction( coordA, junction );
		const roadD = this.cutRoadForJunction( coordB, junction );

		return [ roadC, roadD ];
	}

	private internal_addConnections ( junction: TvJunction, coordA: TvRoadCoord, coordB: TvRoadCoord, roadC: TvRoad, roadD: TvRoad ) {

		this.junctionService.addConnectionsFromContact(
			junction,
			coordA.road,
			coordA.contact,
			coordB.road,
			coordB.contact
		);

		if ( roadC ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				coordA.contact,
				roadC,
				TvContactPoint.START
			);

			this.junctionService.addConnectionsFromContact(
				junction,
				coordB.road,
				coordB.contact,
				roadC,
				TvContactPoint.START
			);
		}

		if ( roadD ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				coordB.road,
				coordB.contact,
				roadD,
				TvContactPoint.START
			);

			this.junctionService.addConnectionsFromContact(
				junction,
				coordA.road,
				coordA.contact,
				roadD,
				TvContactPoint.START
			);

		}

		if ( roadC && roadD ) {

			this.junctionService.addConnectionsFromContact(
				junction,
				roadC,
				TvContactPoint.START,
				roadD,
				TvContactPoint.START
			);

		}

	}
}
