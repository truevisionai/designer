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
import { Vector3 } from 'three';
import { Maths } from 'app/utils/maths';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { TvPosTheta } from "../../map/models/tv-pos-theta";
import { SplineControlPoint } from "../../objects/road/spline-control-point";
import { RoadControlPoint } from "../../objects/road/road-control-point";
import { RoadTangentPoint } from "../../objects/road/road-tangent-point";
import { SplineUtils } from 'app/utils/spline.utils';
import { RoadFactory } from 'app/factories/road-factory.service';
import { RoadService } from '../road/road.service';
import { SplinePositionService } from './spline-position.service';

@Injectable( {
	providedIn: 'root'
} )
export class SplineService extends BaseDataService<AbstractSpline> {

	constructor (
		public mapService: MapService,
		public roadFactory: RoadFactory,
		public roadService: RoadService,
		private splinePositionService: SplinePositionService,
	) {
		super();
	}

	get nonJunctionSplines () {
		return this.mapService.nonJunctionSplines;
	}

	all (): AbstractSpline[] {

		return this.mapService.splines;

	}

	findById ( id: number ) {

		return this.mapService.findSplineById( id );

	}

	add ( spline: AbstractSpline ) {

		if ( spline.segmentMap.length == 0 ) {

			const road = this.roadFactory.createDefaultRoad();

			road.spline = spline;

			spline.segmentMap.set( 0, road );

			this.mapService.addRoad( road );
		}

		this.mapService.map.addSpline( spline );

		MapEvents.splineCreated.emit( new SplineCreatedEvent( spline ) );

	}

	remove ( spline: AbstractSpline ) {

		MapEvents.splineRemoved.emit( new SplineRemovedEvent( spline ) );

	}

	update ( spline: AbstractSpline ): void {

		this.updateSpline( spline );

	}

	updateSpline ( spline: AbstractSpline ): void {

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( spline ) );

	}

	removePoint ( spline: AbstractSpline, point: AbstractControlPoint ): void {

		const index = spline.controlPoints.findIndex( p => p.id === point.id );

		if ( index == -1 ) return;

		spline.controlPoints.splice( index, 1 );

		this.updateIndexes( spline );

	}

	removePointAndUpdateSpline ( spline: AbstractSpline, point: AbstractControlPoint ): void {

		this.removePoint( spline, point );

		this.update( spline );

	}

	addOrInsertPoint ( spline: AbstractSpline, point: AbstractControlPoint ): void {

		let index: number;

		if ( point.userData.insert ) {

			index = this.findIndex( spline, point.position );

			spline.controlPoints.splice( index, 0, point );

		} else {

			spline.addControlPoint( point );

		}

		this.updateIndexes( spline );

		this.updatePointHeading( spline, point, point.index );

	}

	addPointAndUpdateSpline ( spline: AbstractSpline, point: AbstractControlPoint, index?: number ): void {

		index = index ?? spline.controlPoints.length;

		spline.controlPoints.splice( index, 0, point );

		this.updatePointHeading( spline, point, index );

		this.updateIndexes( spline );

		this.update( spline );

	}

	updatePointHeading ( spline: AbstractSpline, currentPoint: AbstractControlPoint, index: number ): void {

		if ( index == 0 ) return;

		if ( spline.type !== SplineType.EXPLICIT ) return;

		if ( !( currentPoint instanceof RoadControlPoint ) ) return;

		const nextPoint = spline.controlPoints[ index + 1 ];

		const previousPoint = spline.controlPoints[ index - 1 ];

		if ( nextPoint instanceof RoadControlPoint ) {

			currentPoint.hdg = Maths.heading( currentPoint.position, nextPoint.position );

		} else if ( previousPoint instanceof RoadControlPoint ) {

			currentPoint.hdg = Maths.heading( previousPoint.position, currentPoint.position );

		}

		if ( previousPoint instanceof RoadControlPoint ) {

			previousPoint.hdg = Maths.heading( previousPoint.position, currentPoint.position );

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

	getPoints ( spline: AbstractSpline, step: number ): Vector3[] {

		return this.splinePositionService.getPoints( spline, step );

	}

	getPoint ( spline: AbstractSpline, t: number, offset = 0 ) {

		return this.splinePositionService.getPoint( spline, t, offset );

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

	getCoordAt ( spline: AbstractSpline, point: Vector3 ): TvPosTheta {

		return this.splinePositionService.getCoordAt( spline, point );

	}

	getCoordAtOffset ( spline: AbstractSpline, sOffset: number ): TvPosTheta {

		return this.splinePositionService.getCoordAtOffset( spline, sOffset );

	}

	updateIndexes ( spline: AbstractSpline ): void {

		spline.updateIndexes();

	}

	findIndex ( spline: AbstractSpline, position: Vector3 ): number {

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

			point.update();

		} else if ( point instanceof RoadControlPoint ) {

			point.update();

		} else if ( point instanceof RoadTangentPoint ) {

			point.update();

			point.controlPoint.update();

		} else {

			console.error( 'Unknown control point type', point );

		}

	}

}
