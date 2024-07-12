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
import { Box3, BufferAttribute, Vector2, Vector3 } from 'three';
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

@Injectable( {
	providedIn: 'root'
} )
export class SplineService extends BaseDataService<AbstractSpline> {

	private splinesCache: Map<AbstractSpline, Map<number, number>> = new Map();

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
			const intersection = this.findIntersectionByBounds( spline, otherSpline );
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

		const pointsA = this.getPoints( splineA, stepSize )
		const pointsB = this.getPoints( splineB, stepSize );

		for ( let i = 0; i < pointsA.length - 1; i++ ) {

			for ( let j = 0; j < pointsB.length - 1; j++ ) {

				const a = pointsA[ i ];
				const b = pointsA[ i + 1 ];
				const c = pointsB[ j ];
				const d = pointsB[ j + 1 ];

				const roadWidthA = this.getWidthAt( splineA, a, i * stepSize );
				const roadWidthB = this.getWidthAt( splineB, c, j * stepSize );

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

	hasSegment ( spline: AbstractSpline, segment: TvRoad | TvJunction ) {

		return spline.segmentMap.contains( segment );

	}

	addJunctionSegment ( spline: AbstractSpline, sStart: number, junction: TvJunction ) {

		if ( sStart > this.getLength( spline ) ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart < 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		this.addSegmentSection( spline, sStart, junction );
	}

	addEmptySegment ( spline: AbstractSpline, sStart: number ) {

		if ( sStart > this.getLength( spline ) ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart < 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		// spline.addSegmentSection( sStart, -1, SplineSegmentType.NONE, null );
		this.addSegmentSection( spline, sStart, null );
	}

	addRoadSegmentNew ( spline: AbstractSpline, sStart: number, road: TvRoad ) {

		if ( sStart > this.getLength( spline ) ) {
			TvConsole.error( 'Start must be less than end' );
			return;
		}

		if ( sStart < 0 ) {
			TvConsole.error( 'Start/End must be greater than 0' );
			return;
		}

		this.addSegmentSection( spline, sStart, road );

	}

	addSegmentSection ( spline: AbstractSpline, sStart: number, segment: TvRoad | TvJunction ) {

		if ( sStart == null ) return;

		// check if road segment already exists
		if ( spline.segmentMap.contains( segment ) ) return;

		if ( spline.segmentMap.hasKey( sStart ) ) {

			console.error( 'Segment already exists', segment );

		} else {

			spline.segmentMap.set( sStart, segment );

		}

	}

	getWidthCache ( spline: AbstractSpline ) {

		if ( !this.splinesCache.has( spline ) ) {

			return this.updateWidthCache( spline );

		}

		return this.splinesCache.get( spline );

	}

	updateWidthCache ( spline: AbstractSpline ) {

		const cache = new Map<number, number>();

		const roads = this.getRoads( spline );

		let lastWidth = -1;

		for ( let i = 0; i < roads.length; i++ ) {

			const road = roads[ i ];

			for ( let s = 0; s <= road.length; s += 5 ) {

				const width = road.getRoadWidthAt( s ).totalWidth;

				if ( width !== lastWidth ) {

					cache.set( road.sStart + s, width );

					lastWidth = width;

				}

			}

		}

		this.splinesCache.set( spline, cache );

		return cache;
	}

	getWidthAt ( spline: AbstractSpline, position?: Vector3, inputS?: number ): number {

		const cache = this.getWidthCache( spline );

		const checkS = inputS //;|| spline.getCoordAt( position )?.s;

		// Find the closest entry that is less than or equal to coord.s
		let closestS = -Infinity;

		let closestWidth = 12; // Default width

		for ( const [ s, width ] of cache ) {

			if ( s <= checkS && s > closestS ) {

				closestS = s;

				closestWidth = width;

			}

		}

		return closestWidth;

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

		const lastSegment = spline.segmentMap.getLast();

		if ( !lastSegment ) return;

		if ( !( lastSegment instanceof TvRoad ) ) return;

		const road = lastSegment;

		if ( !road.successor ) return;

		if ( !road.successor.isRoad ) return;

		const successorRoad = road.successor.getElement<TvRoad>();

		return successorRoad.spline;

	}

	getPredecessorSpline ( spline: AbstractSpline ): AbstractSpline {

		const firstSegment = spline.segmentMap.getFirst();

		if ( !firstSegment ) return;

		if ( !( firstSegment instanceof TvRoad ) ) return;

		const road = firstSegment;

		if ( !road.predecessor ) return;

		if ( !road.predecessor.isRoad ) return;

		const predecessorRoad = road.predecessor.getElement<TvRoad>();

		return predecessorRoad.spline;

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

		const points: Vector3[] = [];

		const length = this.getLength( spline );

		if ( length == 0 ) return [];

		const d = step / length;

		for ( let i = 0; i <= 1; i += d ) {

			points.push( this.getPoint( spline, i, 0 ).toVector3() );

		}

		return points;
	}

	getPoint ( spline: AbstractSpline, t: number, offset = 0 ) {

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

	isConnectionRoad ( spline: AbstractSpline ) {

		if ( spline.segmentMap.length != 1 ) {
			return false;
		}

		const segment = spline.segmentMap.getFirst();

		if ( !( segment instanceof TvRoad ) ) {
			return false;
		}

		return segment.isJunction;
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
