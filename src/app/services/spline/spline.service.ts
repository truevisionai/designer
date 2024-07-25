/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from '../map/map.service';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { MapEvents } from 'app/events/map-events';
import { SplineUpdatedEvent } from 'app/events/spline/spline-updated-event';
import { SplineCreatedEvent } from 'app/events/spline/spline-created-event';
import { SplineRemovedEvent } from 'app/events/spline/spline-removed-event';
import { BaseDataService } from '../../core/interfaces/data.service';
import { Box2, Box3, BufferAttribute, Points, Vector2, Vector3 } from 'three';
import { Maths } from 'app/utils/maths';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SplineIntersection } from '../junction/spline-intersection';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { TvConsole } from "../../core/utils/console";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvPosTheta } from "../../map/models/tv-pos-theta";
import { SplineControlPoint } from "../../objects/spline-control-point";
import { RoadControlPoint } from "../../objects/road-control-point";
import { RoadTangentPoint } from "../../objects/road-tangent-point";
import { TvGeometryType } from "../../map/models/tv-common";
import { CURVE_Y } from "../../core/shapes/spline-config";
import { CatmullRomSpline } from "../../core/shapes/catmull-rom-spline";
import { SimpleControlPoint } from 'app/objects/simple-control-point';
import { SplineUtils } from 'app/utils/spline.utils';
import { DebugDrawService } from '../debug/debug-draw.service';

@Injectable( {
	providedIn: 'root'
} )
export class SplineService extends BaseDataService<AbstractSpline> {

	constructor (
		private mapService: MapService,
	) {
		super();
	}

	get nonJunctionSplines () {
		return this.mapService.nonJunctionSplines;
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

	findIntersections ( spline: AbstractSpline, otherSplines = null ): SplineIntersection[] {

		if ( spline.controlPoints.length < 2 ) return [];

		const splines = otherSplines || this.mapService.nonJunctionSplines;
		const splineCount = splines.length;

		const successorSpline = this.getSuccessorSpline( spline );
		const predecessorSpline = this.getPredecessorSpline( spline );

		const intersections: SplineIntersection[] = [];

		for ( let i = 0; i < splineCount; i++ ) {

			const otherSpline = splines[ i ];

			// NOTE: ignore pre or successor splines
			// MAY NEED TO FIND BETTER OPTION
			if ( otherSpline == spline ) continue;
			if ( otherSpline == successorSpline ) continue;
			if ( otherSpline == predecessorSpline ) continue;

			// const intersection = this.getSplineIntersectionPoint( spline, otherSpline );
			const intersection = this.findIntersectionsViaBox2D( spline, otherSpline );
			// const intersection = this.findClosestIntersection( spline, otherSpline );
			// const intersection = this.getSplineIntersectionPointViaBoundsv2( spline, otherSpline );

			if ( !intersection ) continue;

			intersections.push( intersection );
		}

		return intersections;

	}

	findIntersection ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): Vector3 | null {

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const pointsA = this.getPoints( splineA, stepSize )
		const pointsB = this.getPoints( splineB, stepSize );

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

	findIntersectionsViaBox2D ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): SplineIntersection | null {

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

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		let intersections: SplineIntersection[] = [];
		let startPoint: Vector2 = null;
		let endPoint: Vector2 = null;
		let lastIntersection = false;
		let currentIntersectionBox = new Box2(); // To track the intersection area

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

					if ( !lastIntersection ) {

						startPoint = getAveragePoint( intersection );

						currentIntersectionBox.copy( intersection );

					} else {

						currentIntersectionBox.union( intersection );

					}

					endPoint = getAveragePoint( intersection );

					lastIntersection = true;

					currentIntersection = true;

				}

			}

			if ( lastIntersection && !currentIntersection ) {

				const average = getAveragePoint( currentIntersectionBox )
				const center = new Vector3( average.x, average.y, 0 );
				const intersection = new SplineIntersection( splineA, splineB, center );

				intersection.start = startPoint;
				intersection.end = endPoint;
				intersection.area = currentIntersectionBox.clone();

				intersections.push( intersection );

				lastIntersection = false; // Reset intersection tracking

				currentIntersectionBox.makeEmpty(); // Reset the intersection box

			}

		}

		if ( lastIntersection ) {

			const average = getAveragePoint( currentIntersectionBox )
			const center = new Vector3( average.x, average.y, 0 );
			const intersection = new SplineIntersection( splineA, splineB, center );

			intersection.start = startPoint;
			intersection.end = endPoint;
			intersection.area = currentIntersectionBox.clone();

			intersections.push( intersection );

		}

		if ( intersections.length > 0 ) {

			intersections.forEach( intersection => {

				this.computeOffsets( intersection );

			} )

			// TODO: support multiple junctions per spline
			// for now return the first intersection
			return intersections[ 0 ];
		}

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

		const splineACoords = corners.map( corner => this.getCoordAt( intersection.spline, corner ) ).sort( ( a, b ) => a.s - b.s );
		const splineBCoords = corners.map( corner => this.getCoordAt( intersection.otherSpline, corner ) ).sort( ( a, b ) => a.s - b.s );

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

	}

	findClosestIntersection ( splineA: AbstractSpline, splineB: AbstractSpline, stepSize = 1 ): SplineIntersection | null {

		function createBoundingBoxForSegment ( start: Vector3, end: Vector3, roadWidth: number ): Box3 {

			const box = new Box3();

			box.setFromCenterAndSize( start.clone().add( end ).multiplyScalar( 0.5 ), new Vector3( roadWidth, roadWidth, Math.abs( start.z - end.z ) ) );

			return box;

		}

		if ( splineA == splineB ) return;

		if ( !this.intersectsSplineBox( splineA, splineB ) ) return;

		const pointsA = this.getPoints( splineA, stepSize );
		const pointsB = this.getPoints( splineB, stepSize );

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

	removeControlPoint ( spline: AbstractSpline, point: AbstractControlPoint ) {

		const index = spline.controlPoints.findIndex( p => p.id === point.id );

		if ( index == -1 ) return;

		spline.controlPoints.splice( index, 1 );

		this.updateIndexes( spline );

		this.update( spline );

	}

	insertControlPoint ( spline: AbstractSpline, point: AbstractControlPoint ) {

		const index = this.findIndex( spline, point.position );

		this.addControlPoint( spline, point, index );

	}

	addControlPoint ( spline: AbstractSpline, point: AbstractControlPoint, index?: number ) {

		index = index || spline.controlPoints.length;

		spline.controlPoints.splice( index, 0, point );

		this.updatePointHeading( spline, point, index );

		this.updateIndexes( spline );

		this.update( spline );

	}

	updatePointHeading ( spline: AbstractSpline, point: AbstractControlPoint, index: number ) {

		if ( index == 0 ) return;

		if ( spline.type !== SplineType.EXPLICIT ) return;

		if ( !( point instanceof RoadControlPoint ) ) return;

		point.segmentType = TvGeometryType.SPIRAL;

		const nextPoint = spline.controlPoints[ index + 1 ];

		const previousPoint = spline.controlPoints[ index - 1 ];

		if ( nextPoint instanceof RoadControlPoint ) {

			point.hdg = Maths.heading( point.position, nextPoint.position );

		}

		if ( previousPoint instanceof RoadControlPoint ) {

			previousPoint.segmentType = TvGeometryType.SPIRAL;

			previousPoint.hdg = Maths.heading( previousPoint.position, point.position );

		}

	}

	getSuccessorSpline ( spline: AbstractSpline ): AbstractSpline {

		return SplineUtils.getSuccessorSpline( spline );

	}

	getPredecessorSpline ( spline: AbstractSpline ): AbstractSpline {

		return SplineUtils.getPredecessorSpline( spline );

	}

	findFirstRoad ( spline: AbstractSpline ) {

		const roads = this.getRoads( spline );

		return roads.length > 0 ? roads[ 0 ] : null;

	}

	findLastRoad ( spline: AbstractSpline ) {

		const roads = this.getRoads( spline );

		return roads.length > 0 ? roads[ roads.length - 1 ] : null;

	}

	getRoads ( spline: AbstractSpline ) {

		const roads: TvRoad[] = [];

		spline.segmentMap.forEach( segment => {

			if ( segment instanceof TvRoad ) {

				roads.push( segment );

			}

		} );

		return roads;

	}

	getJunctions ( spline: AbstractSpline ) {

		const junctions: TvJunction[] = [];

		spline.segmentMap.forEach( segment => {

			if ( segment instanceof TvJunction ) {

				junctions.push( segment );

			}

		} );

		return junctions;

	}

	getPoints ( spline: AbstractSpline, step: number ) {

		if ( spline instanceof CatmullRomSpline ) {
			return spline.getPoints();
		}

		const points: Vector3[] = [];

		const length = this.getLength( spline );

		if ( length == 0 ) return [];

		const d = step / length;

		for ( let i = 0; i <= 1; i += d ) {

			const point = this.getPoint( spline, i, 0 );

			if ( point instanceof Vector3 ) {
				points.push( point );
			} else {
				points.push( point.toVector3() );
			}

		}

		return points;
	}

	getPoint ( spline: AbstractSpline, t: number, offset = 0 ) {

		if ( spline instanceof CatmullRomSpline ) {
			return spline.curve.getPointAt( t );
		}

		const length = this.getLength( spline );

		const s = length * t;

		const geometry = spline.geometries.find( g => s >= g.s && s <= g.endS );

		if ( !geometry ) {
			console.error( 'No geometry found for s:', s, spline );
			return new TvPosTheta();
		}

		const posTheta = geometry.getRoadCoord( s );

		posTheta.addLateralOffset( offset );

		return posTheta;

	}

	getLength ( spline: AbstractSpline ): number {

		return spline.getLength();

	}

	/**
	 *
	 * @param spline
	 * @returns
	 * @deprecated use SplineUtils.isConnectedToJunction
	 */
	isConnectionRoad ( spline: AbstractSpline ) {

		return SplineUtils.isConnection( spline );

	}

	getCoordAt ( spline: AbstractSpline, point: Vector3 ) {

		let minDistance = Number.MAX_SAFE_INTEGER;

		const coordinates = new TvPosTheta();

		for ( const geometry of spline.geometries ) {

			const temp = new TvPosTheta();

			const nearestPoint = geometry.getNearestPointFrom( point.x, point.y, temp );

			const distance = new Vector2( point.x, point.y ).distanceTo( nearestPoint );

			if ( distance < minDistance ) {

				minDistance = distance;

				coordinates.copy( temp );

			}

		}

		return coordinates;

	}

	getCoordAtOffset ( spline: AbstractSpline, sOffset: number ) {

		for ( const geometry of spline.geometries ) {

			if ( sOffset >= geometry.s && sOffset <= geometry.endS ) {

				return geometry.getRoadCoord( sOffset );

			}

		}

	}

	updateIndexes ( spline: AbstractSpline ) {

		spline.controlPoints.forEach( ( point, index ) => point.tagindex = index );

	}

	findIndex ( spline: AbstractSpline, position: Vector3 ) {

		let minDistance = Infinity;
		let index = spline.controlPoints.length; // insert at the end by default

		// Ensure the loop includes the segment between the last and first control points
		for ( let i = 0; i < spline.controlPoints.length; i++ ) {

			const current = spline.controlPoints[ i ];

			const nextIndex = ( i + 1 ) % spline.controlPoints.length;

			// If the spline is open, do not consider the last segment
			if ( !spline.closed && nextIndex === 0 ) {
				break;
			}

			// Use modulo to wrap around to the first point when reaching the end
			const next = spline.controlPoints[ nextIndex ];

			const distance = this.calculateDistanceToSegment( position, current, next );

			if ( distance < minDistance ) {
				minDistance = distance;
				index = nextIndex;
			}

		}

		return index;
	}

	protected calculateHdg ( spline: AbstractSpline, index: number, position: Vector3 ) {

		const previousPoint = spline.controlPoints[ index - 1 ];

		let hdg: number = 0;

		if ( previousPoint ) {

			// hdg from previous point to new point
			hdg = Maths.heading( previousPoint.position, position );

			if ( isNaN( hdg ) ) {
				hdg = Maths.vec2Angle( previousPoint.position.x, previousPoint.position.y );
			}

			if ( isNaN( hdg ) ) {
				hdg = 0;
			}

		}

		return hdg;
	}

	private calculateDistanceToSegment ( newPosition: Vector3, pointA: AbstractControlPoint, pointB: AbstractControlPoint ): number {

		const segment = pointB.position.clone().sub( pointA.position ); // Vector representing the segment
		const startToPoint = newPosition.clone().sub( pointA.position ); // Vector from start point to newPoint

		const projectionScalar = startToPoint.dot( segment ) / segment.lengthSq(); // Scalar projection
		const projection = segment.clone().multiplyScalar( projectionScalar ); // Vector projection

		if ( projectionScalar < 0 ) {

			return startToPoint.length(); // Closest point is pointA

		} else if ( projectionScalar > 1 ) {

			return newPosition.distanceTo( pointB.position ); // Closest point is pointB

		} else {

			const closestPoint = pointA.position.clone().add( projection ); // Closest point on the segment
			return newPosition.distanceTo( closestPoint ); // Distance to closest point on the segment

		}

	}

	/**
	 * Handle point update, it should update geometry and other related data
	 * @param point
	 */
	updateControlPoint ( point: AbstractControlPoint ): void {

		if ( point instanceof SplineControlPoint ) {

			this.updateSplineControlPoint( point );

			this.update( point.spline );

		} else if ( point instanceof RoadControlPoint ) {

			this.updateRoadControlPoint( point );

			this.update( point.spline );

		} else if ( point instanceof RoadTangentPoint ) {

			this.updateRoadTangentPoint( point );

			this.update( point.road.spline );

		} else {

			console.error( 'Unknown control point type', point );

		}

	}

	private updateSplineControlPoint ( point: SplineControlPoint ) {

	}

	private updateRoadControlPoint ( point: RoadControlPoint ) {

		this.updateTangentLine( point );

	}

	private updateTangentLine ( point: RoadControlPoint ) {

		if ( point.frontTangent ) {

			point.segmentType = TvGeometryType.SPIRAL;

			const frontPosition = new Vector3( Math.cos( point.hdg ), Math.sin( point.hdg ), CURVE_Y )
				.multiplyScalar( point.frontTangent.length )
				.add( point.position );

			point.frontTangent.copyPosition( frontPosition );

		}

		if ( point.backTangent ) {

			point.segmentType = TvGeometryType.SPIRAL;

			const backPosition = new Vector3( Math.cos( point.hdg ), Math.sin( point.hdg ), CURVE_Y )
				.multiplyScalar( -point.backTangent.length )
				.add( point.position );

			point.backTangent.copyPosition( backPosition );

		}

		point.frontTangent?.updateTangents();

		point.backTangent?.updateTangents();

		if ( point.frontTangent || point.backTangent ) {

			if ( point.tangentLine && point.backTangent ) {

				const buffer = point.tangentLineGeometry.attributes.position as BufferAttribute;

				buffer.setXYZ( 0, point.frontTangent.position.x, point.frontTangent.position.y, point.frontTangent.position.z );

				buffer.setXYZ( 1, point.backTangent.position.x, point.backTangent.position.y, point.backTangent.position.z );

				buffer.needsUpdate = true;
			}

		}

	}

	private updateRoadTangentPoint ( point: RoadTangentPoint ) {

		// point.controlPoint.update();

		point.updateTangents();

		this.updateTangentLine( point.controlPoint );

		// point.road.update();

		// point.updateSuccessor();

		// point.updatePredecessor();
	}

}
