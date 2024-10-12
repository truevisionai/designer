/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvContactPoint, TvLaneSide } from 'app/map/models/tv-common';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { AutoSpline } from 'app/core/shapes/auto-spline-v2';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { Vector3 } from 'three';
import { RoadNode } from 'app/objects/road/road-node';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { ExplicitSpline } from "../../core/shapes/explicit-spline";
import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';


export class ManeueverHelper {

	static getPositionsFromLaneCoord ( start: TvLaneCoord, end: TvLaneCoord, divider = 3 ): Vector3[] {

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

	static getPositions ( start: Vector3, startDirection: Vector3, end: Vector3, endDirection: Vector3, divider = 3 ): Vector3[] {

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

	createSplineFromNodes ( firstNode: RoadNode, secondNode: RoadNode ) {

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

	static createManeuverSpline ( entry: TvLaneCoord, exit: TvLaneCoord, divider = 3 ): AbstractSpline {

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

	createSpline ( v1: Vector3, v1Direction: Vector3, v4: Vector3, v4Direction: Vector3 ): AbstractSpline {

		return this.createRoadSpline( null, v1, v1Direction, v4, v4Direction );

	}

	private createRoadSpline ( road: TvRoad, v1: Vector3, v1Direction: Vector3, v4: Vector3, v4Direction: Vector3 ): AbstractSpline {

		const spline = SplineFactory.createRoadSpline( v1, v1Direction, v4, v4Direction );

		if ( road ) spline.addSegment( 0, road );

		return spline;

	}

	static createRoadSpline ( start: Vector3, startDirection: Vector3, end: Vector3, endDirection: Vector3, divider = 3 ): AbstractSpline {

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

		spline.controlPoints.push( ControlPointFactory.createControl( spline, start ) );
		spline.controlPoints.push( ControlPointFactory.createControl( spline, v2 ) );
		spline.controlPoints.push( ControlPointFactory.createControl( spline, v3 ) );
		spline.controlPoints.push( ControlPointFactory.createControl( spline, end ) );

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
	static createStraightSplineAndPoints ( start: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ): AbstractSpline {

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

		spline.controlPoints.push( ControlPointFactory.createControl( spline, position, 0 ) );

		return spline;

	}

	static createExplicitSpline ( geometries: TvAbstractRoadGeometry[], road: TvRoad ): ExplicitSpline {

		function addControlPoint ( spline: ExplicitSpline, geometry: TvAbstractRoadGeometry, index: number, position: Vector3, hdg: number ) {

			const point = ControlPointFactory.createRoadControlPoint( spline, geometry, index, position, hdg );

			spline.controlPoints.push( point );

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

		spline.controlPoints.forEach( cp => cp.userData.roadId = road.id );

		road.sStart = 0;

		return spline;

	}
}
