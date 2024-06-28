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
import { Box3, Vector2, Vector3 } from 'three';
import { Maths } from 'app/utils/maths';
import { TvRoad } from 'app/map/models/tv-road.model';
import { SplineIntersection } from '../junction/spline-intersection';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { TvConsole } from "../../core/utils/console";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { CatmullRomSpline } from "../../core/shapes/catmull-rom-spline";
import { TvPosTheta } from "../../map/models/tv-pos-theta";

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

		if ( spline.controlPoints.length < 2 ) return [];

		const splines = this.mapService.nonJunctionSplines;
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

		if ( spline.segmentMap.has( sStart ) ) {

			console.error( 'Segment already exists', segment );

		} else {

			spline.segmentMap.set( sStart, segment );

		}

	}

	removeJunctionSegment ( spline: AbstractSpline, junction: TvJunction ) {

		if ( !spline.segmentMap.contains( junction ) ) return;

		this.removeSegment( spline, junction );

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

	private removeSegment ( spline: AbstractSpline, segment: TvRoad | TvJunction ): void {

		spline.segmentMap.remove( segment );

		// // make sure first segment has start = 0
		// const firstSegment = spline.getFirstSegment();
		//
		// if ( firstSegment instanceof TvRoad ) {
		//
		// 	firstSegment.sStart = 0;
		//
		// }
		//
		// if ( firstSegment.start > 0 && firstSegment.isJunction ) {
		//
		// 	this.addDefaultSegment( spline );
		//
		// }

		// spline.update();

	}

	private addDefaultSegment ( spline: AbstractSpline ) {

		// const road = this.roadFactory.createDefaultRoad();
		//
		// road.spline = spline;
		//
		// spline.addRoadSegment( 0, road );
		//
		// this.roadService.add( road );

	}

	removeControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		const index = spline.controlPoints.findIndex( p => p.id === controlPoint.id );

		if ( index == -1 ) return;

		spline.controlPoints.splice( index, 1 );

		this.updateIndexes( spline );

		this.update( spline );

	}

	insertControlPoint ( spline: AbstractSpline, newPoint: AbstractControlPoint ) {

		const index = this.findIndex( spline, newPoint );

		spline.controlPoints.splice( index, 0, newPoint );

		this.updateIndexes( spline );

		this.update( spline );

	}

	addControlPoint ( spline: AbstractSpline, controlPoint: AbstractControlPoint ) {

		spline.controlPoints.push( controlPoint );

		this.updateIndexes( spline );

		this.update( spline );

	}

	updateGeometry ( spline: AbstractSpline ) {

		// spline.update();

		// const geometries = spline.exportGeometries();

		// const splineLength = spline.getLength();

		// const segments = spline.segmentMap.toArray();

		// for ( let i = 0; i < segments.length; i++ ) {

		// 	const segment = segments[ i ];

		// 	const nextSegment = spline.segmentMap.getNext( segment );

		// 	const currentKey = spline.segmentMap.findKey( segment );

		// 	const nextKey = spline.segmentMap.findKey( nextSegment );

		// 	// Clear previous geometries
		// 	// this.geometries.clear();

		// 	let segmentLength: number;

		// 	if ( nextSegment ) {
		// 		segmentLength = nextKey - currentKey;
		// 	} else {
		// 		segmentLength = splineLength - currentKey;
		// 	}

		// 	// Variables to keep track of the current position and remaining length of the segment
		// 	let currentS = currentKey;
		// 	let remainingLength = segmentLength;
		// 	let lengthCovered = 0;

		// 	if ( !( segment instanceof TvRoad ) ) {
		// 		remainingLength -= segmentLength;
		// 		currentS += segmentLength;
		// 		lengthCovered += segmentLength;
		// 		continue;
		// 	}

		// 	// Iterate through the geometries to find those that fall within the segment
		// 	for ( const geometry of geometries ) {

		// 		// If the current position has surpassed this geometry, skip it
		// 		if ( currentS > geometry.endS ) {
		// 			continue;
		// 		}

		// 		// If the current position is before this geometry, break the loop as we have covered all relevant geometries
		// 		if ( currentS < geometry.s ) {
		// 			break;
		// 		}

		// 		// Cut the geometry if the current position is within this geometry's bounds
		// 		if ( currentS >= geometry.s && currentS < geometry.endS ) {
		// 			// The segment's current position is within this geometry
		// 			let section: TvAbstractRoadGeometry;
		// 			if ( currentS + remainingLength <= geometry.endS ) {
		// 				// The rest of the segment fits within this geometry
		// 				const sections = geometry.cut( currentS );
		// 				section = sections[ 1 ];
		// 				section.length = remainingLength;
		// 				// Update the start 's' to be relative to the segment's start, not the spline's start
		// 				section.s = lengthCovered;

		// 				remainingLength = 0; // The segment is now fully covered
		// 			} else {
		// 				// The segment extends beyond this geometry
		// 				const sections = geometry.cut( currentS );
		// 				section = sections[ 1 ];
		// 				section.s = lengthCovered;
		// 				section.length = geometry.endS - currentS; // The section's length is the remaining length of the geometry
		// 				remainingLength -= section.length; // Reduce the remaining length by what's covered by this geometry
		// 			}

		// 			// Update the start 's' to be relative to the segment's start, not the spline's start
		// 			// section.s -= segment.start;
		// 			// Add this section to the segment's geometries
		// 			segment.geometries.push( section );

		// 			// Update the current position
		// 			currentS += section.length;

		// 			// Update the length covered so far
		// 			lengthCovered += section.length;

		// 			// If the segment is fully covered, break the loop
		// 			if ( remainingLength <= 0 ) {
		// 				break;
		// 			}
		// 		}
		// 	}

		// 	// Validation to ensure we are not exceeding the segment's length
		// 	// const totalGeomLength = segment.geometries.reduce( ( total, geom ) => total + geom.length, 0 );
		// 	// if ( segment.length != -1 && totalGeomLength > segment.length ) {
		// 	// 	console.error( `Total length of geometries exceeds the segment length for segment starting at ${ segment.start }`, segment.length, totalGeomLength, segment.geometries );
		// 	// 	// Additional handling may be needed here depending on your application's requirements
		// 	// }
		// }
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

		const posTheta = geometry.getRoadCoord( s );

		posTheta.addLateralOffset( offset );

		return posTheta;

	}

	getLength ( spline: AbstractSpline ): number {

		return spline.getLength();

	}

	isConnectionRoad ( spline: AbstractSpline ) {

		if ( spline.segmentMap.size != 1 ) {
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


	protected findIndex ( spline: AbstractSpline, newPoint: AbstractControlPoint ) {

		let minDistance = Infinity;
		let index = spline.controlPoints.length; // insert at the end by default

		// Ensure the loop includes the segment between the last and first control points
		for ( let i = 0; i < spline.controlPoints.length; i++ ) {

			const pointA = spline.controlPoints[ i ];

			// Use modulo to wrap around to the first point when reaching the end
			const pointB = spline.controlPoints[ ( i + 1 ) % spline.controlPoints.length ];

			const distance = this.calculateDistanceToSegment( newPoint, pointA, pointB );

			if ( distance < minDistance ) {
				minDistance = distance;
				index = i + 1;
			}

		}

		// If the closest segment is the last one, adjust the index to be 0 to insert after the last point
		if ( index === spline.controlPoints.length ) {
			index = 0;
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

	private calculateDistanceToSegment ( newPoint: AbstractControlPoint, pointA: AbstractControlPoint, pointB: AbstractControlPoint ): number {

		const segment = pointB.position.clone().sub( pointA.position ); // Vector representing the segment
		const startToPoint = newPoint.position.clone().sub( pointA.position ); // Vector from start point to newPoint

		const projectionScalar = startToPoint.dot( segment ) / segment.lengthSq(); // Scalar projection
		const projection = segment.clone().multiplyScalar( projectionScalar ); // Vector projection

		if ( projectionScalar < 0 ) {

			return startToPoint.length(); // Closest point is pointA

		} else if ( projectionScalar > 1 ) {

			return newPoint.position.distanceTo( pointB.position ); // Closest point is pointB

		} else {

			const closestPoint = pointA.position.clone().add( projection ); // Closest point on the segment
			return newPoint.position.distanceTo( closestPoint ); // Distance to closest point on the segment

		}

	}

}
