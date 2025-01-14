/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvContactPoint, TvLaneSide } from 'app/map/models/tv-common';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { AutoSpline } from 'app/core/shapes/auto-spline-v2';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { SplineType } from 'app/core/shapes/spline-type';
import { Vector3 } from 'app/core/maths';
import { RoadNode } from 'app/objects/road/road-node';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { ExplicitSpline } from "../../core/shapes/explicit-spline";
import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';


export class ManeueverHelper {

	static getPositionsFromLaneCoord ( start: TvLaneCoord, end: TvLaneCoord, divider: number = 3 ): Vector3[] {

		let entryDirection: Vector3, exitDirection: Vector3;

		if ( start.contact === TvContactPoint.START ) {
			entryDirection = start.posTheta.toDirectionVector().multiplyScalar( -1 );
		} else {
			entryDirection = start.posTheta.toDirectionVector();
		}

		if ( end.contact === TvContactPoint.START ) {
			exitDirection = end.posTheta.toDirectionVector().multiplyScalar( -1 );
		} else {
			exitDirection = end.posTheta.toDirectionVector();
		}

		return this.getPositions( start.position, entryDirection, end.position, exitDirection, divider );
	}

	static getPositions ( start: Vector3, startDirection: Vector3, end: Vector3, endDirection: Vector3, divider: number = 3 ): Vector3[] {

		const d1 = startDirection.clone().normalize();
		const d4 = endDirection.clone().normalize();

		const distance = start.distanceTo( end );

		const v2 = start.clone().add( d1.clone().multiplyScalar( distance / divider ) );
		const v3 = end.clone().add( d4.clone().multiplyScalar( distance / divider ) );

		return [ start, v2, v3, end ];

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class SplineFactory {

	constructor () {
	}

	createConnectingRoadSpline ( road: TvRoad, incoming: TvRoadCoord, outgoing: TvRoadCoord ): AbstractSpline {

		if ( incoming == null ) throw new Error( 'incoming is null' );
		if ( outgoing == null ) throw new Error( 'outgoing is null' );

		const a = incoming.position;
		const b = outgoing.position;

		let aDirection: Vector3, bDirection: Vector3;

		if ( incoming.contact === TvContactPoint.START ) {
			aDirection = incoming.posTheta.toDirectionVector().multiplyScalar( -1 );
		} else {
			aDirection = incoming.posTheta.toDirectionVector();
		}

		if ( outgoing.contact === TvContactPoint.START ) {
			bDirection = outgoing.posTheta.toDirectionVector().multiplyScalar( -1 );
		} else {
			bDirection = outgoing.posTheta.toDirectionVector();
		}

		return this.createRoadSpline( road, a, aDirection, b, bDirection );
	}

	createSplineFromNodes ( firstNode: RoadNode, secondNode: RoadNode ): AbstractSpline {

		if ( firstNode == null ) throw new Error( 'firstNode is null' );
		if ( secondNode == null ) throw new Error( 'secondNode is null' );

		const a = firstNode.getPosition().toVector3();
		const b = secondNode.getPosition().toVector3();

		let aDirection: Vector3, bDirection: Vector3;

		if ( firstNode.contact === TvContactPoint.START ) {
			aDirection = firstNode.getPosition().toDirectionVector().multiplyScalar( -1 );
		} else {
			aDirection = firstNode.getPosition().toDirectionVector();
		}

		if ( secondNode.contact === TvContactPoint.START ) {
			bDirection = secondNode.getPosition().toDirectionVector().multiplyScalar( -1 );
		} else {
			bDirection = secondNode.getPosition().toDirectionVector();
		}

		return this.createSpline( a, aDirection, b, bDirection );
	}

	static createFromLaneCoords ( entry: TvLaneCoord, exit: TvLaneCoord, divider: number = 3 ): AbstractSpline {

		let entryDirection: Vector3, exitDirection: Vector3;

		if ( entry.contact === TvContactPoint.START ) {
			entryDirection = entry.posTheta.toDirectionVector().multiplyScalar( -1 );
		} else {
			entryDirection = entry.posTheta.toDirectionVector();
		}

		if ( exit.contact === TvContactPoint.START ) {
			exitDirection = exit.posTheta.toDirectionVector().multiplyScalar( -1 );
		} else {
			exitDirection = exit.posTheta.toDirectionVector();
		}

		return this.createRoadSpline( entry.position, entryDirection, exit.position, exitDirection, divider );
	}

	static createFromRoadCoords ( start: TvRoadCoord | RoadNode, end: TvRoadCoord | RoadNode ): AbstractSpline {

		let startDirection: Vector3, endDirection: Vector3;

		if ( start.contact === TvContactPoint.START ) {
			startDirection = start.posTheta.toDirectionVector().multiplyScalar( -1 );
		} else {
			startDirection = start.posTheta.toDirectionVector();
		}

		if ( end.contact === TvContactPoint.START ) {
			endDirection = end.posTheta.toDirectionVector().multiplyScalar( -1 );
		} else {
			endDirection = end.posTheta.toDirectionVector();
		}

		const spline = this.createRoadSpline( start.position, startDirection, end.position, endDirection );

		spline.updateSegmentGeometryAndBounds();

		return spline;
	}

	createSpline ( v1: Vector3, v1Direction: Vector3, v4: Vector3, v4Direction: Vector3 ): AbstractSpline {

		return this.createRoadSpline( null, v1, v1Direction, v4, v4Direction );

	}

	private createRoadSpline ( road: TvRoad, v1: Vector3, v1Direction: Vector3, v4: Vector3, v4Direction: Vector3 ): AbstractSpline {

		const spline = SplineFactory.createRoadSpline( v1, v1Direction, v4, v4Direction );

		if ( road ) road.setSplineAndSegment( spline );

		return spline;

	}

	static createRoadSpline ( start: Vector3, startDirection: Vector3, end: Vector3, endDirection: Vector3, divider: number = 3 ): AbstractSpline {

		if ( start == null ) throw new Error( 'entry is null' );
		if ( startDirection == null ) throw new Error( 'entryDirection is null' );
		if ( end == null ) throw new Error( 'exit is null' );
		if ( endDirection == null ) throw new Error( 'exitDirection is null' );

		// directions must be normalized
		const d1 = startDirection.clone().normalize();
		const d4 = endDirection.clone().normalize();

		const distance = start.distanceTo( end );

		// v2 and v3 are the control points
		const v2 = start.clone().add( d1.clone().multiplyScalar( distance / divider ) );
		const v3 = end.clone().add( d4.clone().multiplyScalar( distance / divider ) );

		const spline = new AutoSpline();

		spline.addControlPoint( start );
		spline.addControlPoint( v2 );
		spline.addControlPoint( v3 );
		spline.addControlPoint( end );

		spline.update();

		return spline;
	}

	/**
	 * creates a straight spline
	 * @param start
	 * @param length
	 * @param degrees
	 * @param type
	 */
	static createStraightSplineAndPoints ( start: Vector3, length: number = 100, degrees: number = 0, type: SplineType = SplineType.AUTOV2 ): AbstractSpline {

		const spline = this.createSpline( type );

		spline.addControlPoints( ControlPointFactory.createStraightControlPoints( spline, start, length, degrees ) );

		return spline;
	}

	static createSpline ( type: SplineType = SplineType.AUTOV2 ): AbstractSpline {

		let spline: AbstractSpline;

		if ( type === SplineType.EXPLICIT ) {
			spline = new ExplicitSpline();
		} else {
			spline = new AutoSpline();
		}

		return spline;
	}

	static createFromPoints ( points: AbstractControlPoint[], type?: SplineType ): AbstractSpline {

		type = type || SplineType.AUTOV2;

		let spline: AbstractSpline;

		if ( type === SplineType.EXPLICIT ) {

			spline = new ExplicitSpline();

		} else {

			spline = new AutoSpline();

		}

		points.forEach( point => spline.addControlPoint( point ) );

		return spline;

	}

	static createAtPosition ( position: Vector3, type?: SplineType ): AbstractSpline {

		type = type || SplineType.AUTOV2;

		let spline: AbstractSpline;

		if ( type === SplineType.EXPLICIT ) {

			spline = new ExplicitSpline();

		} else {

			spline = new AutoSpline();

		}

		spline.addControlPoint( position );

		return spline;

	}

	static createExplicitSpline ( geometries: TvAbstractRoadGeometry[], road: TvRoad ): ExplicitSpline {

		function addControlPoint ( spline: ExplicitSpline, geometry: TvAbstractRoadGeometry, index: number, position: Vector3, hdg: number ): void {

			const point = ControlPointFactory.createRoadControlPoint( spline, geometry, index, position, hdg );

			spline.addControlPoint( point );

		}

		const spline = new ExplicitSpline( road );

		if ( geometries.length === 0 ) return spline;

		let lastGeometry: TvAbstractRoadGeometry;

		for ( let i = 0; i < geometries.length; i++ ) {

			lastGeometry = geometries[ i ];

			spline.addGeometry( lastGeometry );

			addControlPoint( spline, lastGeometry, i, lastGeometry.startV3, lastGeometry.hdg );

		}

		const lastCoord = lastGeometry.endCoord();

		addControlPoint( spline, lastGeometry, geometries.length, lastCoord.toVector3(), lastCoord.hdg );

		spline.getControlPoints().forEach( cp => cp.userData.roadId = road.id );

		road.sStart = 0;

		return spline;

	}

	static createRampRoadSpline ( startPosition: TvLaneCoord | Vector3, endPosition: TvLaneCoord | Vector3 ) {

		function createSplineNew ( start: Vector3, startDirection: Vector3, end: Vector3, endDirection: Vector3, divider: number = 3 ): AbstractSpline {

			// directions must be normalized
			const d1 = startDirection.clone().normalize();

			const distance = start.distanceTo( end );

			// v2 and v3 are the control points
			const p1 = start.clone().add( d1.clone().multiplyScalar( Math.min( distance / divider, 30 ) ) );

			// add 45 degree angle to the direction
			// to smooth out the curve
			const d2 = d1.applyAxisAngle( new Vector3( 0, 0, 1 ), -Math.PI / 2 );
			const p2 = p1.clone().add( d2.clone().multiplyScalar( start.distanceTo( p1 ) * 2 ) );

			const spline = SplineFactory.createSpline();

			spline.addControlPoint( start );
			spline.addControlPoint( end );

			return spline;
		}


		let v1: Vector3, v2: Vector3, d1: Vector3, d2: Vector3;

		if ( startPosition instanceof TvLaneCoord ) {

			v1 = startPosition.position;

			d1 = startPosition.laneDirection;

			// add 45 degree angle to the direction
			// to smooth out the curve
			// d1.applyAxisAngle( new Vector3( 0, 0, 1 ), -Math.PI / 4 );

		} else if ( startPosition instanceof Vector3 ) {

			v1 = startPosition;

			d1 = new Vector3( 0, 0, 1 );

		}

		if ( endPosition instanceof TvLaneCoord ) {

			v2 = endPosition.position;

			d2 = endPosition.laneDirection.negate();

		} else if ( endPosition instanceof Vector3 ) {

			v2 = endPosition;

			d2 = d1.clone().multiplyScalar( -1 );

		}

		const spline = createSplineNew( v1, d1, v2, d2 );

		// spline.updateSegmentGeometryAndBounds();

		return spline;


	}
}
