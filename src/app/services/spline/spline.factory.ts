/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvContactPoint, TvLaneSide } from 'app/map/models/tv-common';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { Vector3 } from 'three';
import { RoadNode } from 'app/objects/road-node';
import { TvRoad } from 'app/map/models/tv-road.model';
import { TvRoadCoord } from 'app/map/models/TvRoadCoord';
import { TvJunctionConnection } from 'app/map/models/junctions/tv-junction-connection';
import { ControlPointFactory } from 'app/factories/control-point.factory';
import { ExplicitSpline } from "../../core/shapes/explicit-spline";
import { Maths } from "../../utils/maths";
import { TvAbstractRoadGeometry } from 'app/map/models/geometries/tv-abstract-road-geometry';
import { RoadControlPoint } from 'app/objects/road-control-point';

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
			aDirection = incoming.toPosTheta().toDirectionVector().multiplyScalar( -1 );
		} else {
			aDirection = incoming.toPosTheta().toDirectionVector();
		}

		if ( outgoing.contact === TvContactPoint.START ) {
			bDirection = outgoing.toPosTheta().toDirectionVector().multiplyScalar( -1 );
		} else {
			bDirection = outgoing.toPosTheta().toDirectionVector();
		}

		return this.createRoadSpline( road, a, aDirection, b, bDirection );
	}

	updateConnectingRoadSpline ( connection: TvJunctionConnection ): void {

		const incomingContact = connection.getIncomingContactPoint();
		const outgoingContact = connection.getOutgoingContactPoint();

		const highestLane = connection.connectingRoad.getFirstLaneSection().getLaneById( -1 );

		const predecessorLane = connection.incomingRoad.getFirstLaneSection().getLaneById( highestLane.predecessorId );
		const succcessorLane = connection.outgoingRoad.getFirstLaneSection().getLaneById( highestLane.successorId );

		const incoming = connection.incomingRoad.getRoadCoordByContact( incomingContact ).toLaneCoord( predecessorLane );
		const outgoing = connection.outgoingRoad.getRoadCoordByContact( outgoingContact ).toLaneCoord( succcessorLane );

		if ( incoming == null ) throw new Error( 'incoming is null' );
		if ( outgoing == null ) throw new Error( 'outgoing is null' );

		const a = incoming.position;
		const b = outgoing.position;

		let aDirection: Vector3, bDirection: Vector3;

		if ( incoming.contact === TvContactPoint.START ) {
			aDirection = incoming.toPosTheta().toDirectionVector().multiplyScalar( -1 );
		} else {
			aDirection = incoming.toPosTheta().toDirectionVector();
		}

		if ( outgoing.contact === TvContactPoint.START ) {
			bDirection = outgoing.toPosTheta().toDirectionVector().multiplyScalar( -1 );
		} else {
			bDirection = outgoing.toPosTheta().toDirectionVector();
		}

		const spline = this.createSpline( a, aDirection, b, bDirection );

		spline.segmentMap.set( 0, connection.connectingRoad );

		connection.connectingRoad.spline = spline

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

	createRampRoadSpline ( entry: TvLaneCoord, exit: TvLaneCoord, side: TvLaneSide ): AbstractSpline {

		if ( entry == null ) throw new Error( 'entry is null' );
		if ( exit == null ) throw new Error( 'exit is null' );
		if ( side == null ) throw new Error( 'side is null' );

		// const nodes = this.getSplinePositions( entry, exit, side );

		const spline = new AutoSplineV2();

		// spline.addControlPointAt( nodes.start )
		// spline.addControlPointAt( nodes.a2.toVector3() )
		// spline.addControlPointAt( nodes.b2.toVector3() )
		// spline.addControlPointAt( nodes.end )

		// spline.controlPoints.forEach( ( cp: RoadControlPoint ) => cp.allowChange = false );

		return spline;
	}

	static createManeuverSpline ( entry: TvLaneCoord, exit: TvLaneCoord, side: TvLaneSide = TvLaneSide.RIGHT ): AbstractSpline {

		if ( entry == null ) throw new Error( 'entry is null' );
		if ( exit == null ) throw new Error( 'exit is null' );
		if ( side == null ) throw new Error( 'side is null' );

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

		return this.createRoadSpline( entry.position, entryDirection, exit.position, exitDirection );
	}

	///**
	// * returns a spline that connects the entry and exit on the junction
	// *
	// * @param entry
	// * @param exit
	// * @param side
	// * @returns
	// */
	//createJunctionSpline ( entry: JunctionEntryObject, exit: JunctionEntryObject, side: TvLaneSide = TvLaneSide.RIGHT ): AbstractSpline {
	//
	//	if ( entry == null ) throw new Error( 'entry is null' );
	//	if ( exit == null ) throw new Error( 'exit is null' );
	//	if ( side == null ) throw new Error( 'side is null' );
	//
	//	// const entryPosition = entry.position;
	//	const entryDirection = entry.getJunctionPosTheta().toDirectionVector();
	//
	//	// const exitPosition = exit.position;
	//	const exitDirection = exit.getJunctionPosTheta().toDirectionVector();
	//
	//	const as = entry.contact === TvContactPoint.START ? 0 : entry.road.length;
	//	const aPosTheta = new TvPosTheta();
	//	const entryPosition = TvMapQueries.getLaneStartPosition( entry.road.id, entry.lane.id, as, 0, aPosTheta );
	//
	//	const bs = exit.contact === TvContactPoint.START ? 0 : exit.road.length;
	//	const bPosTheta = new TvPosTheta();
	//	const exitPosition = TvMapQueries.getLaneStartPosition( exit.road.id, exit.lane.id, bs, 0, bPosTheta );
	//
	//	return this.createSpline( entryPosition, entryDirection, exitPosition, exitDirection );
	//}

	createSpline ( v1: Vector3, v1Direction: Vector3, v4: Vector3, v4Direction: Vector3 ): AbstractSpline {

		return this.createRoadSpline( null, v1, v1Direction, v4, v4Direction );

	}

	private createRoadSpline ( road: TvRoad, v1: Vector3, v1Direction: Vector3, v4: Vector3, v4Direction: Vector3 ): AbstractSpline {

		const spline = SplineFactory.createRoadSpline( v1, v1Direction, v4, v4Direction );

		if ( road ) spline.segmentMap.set( 0, road );

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

		const spline = new AutoSplineV2();

		spline.controlPoints.push( ControlPointFactory.createControl( spline, start ) );
		spline.controlPoints.push( ControlPointFactory.createControl( spline, v2 ) );
		spline.controlPoints.push( ControlPointFactory.createControl( spline, v3 ) );
		spline.controlPoints.push( ControlPointFactory.createControl( spline, end ) );

		spline.update();

		return spline;
	}

	// end position is always at the exit
	//private getSplinePositions ( entry: JunctionEntryObject, exit: JunctionEntryObject, laneSide: TvLaneSide ) {
	//
	//	const as = entry.contact === TvContactPoint.START ? 0 : entry.road.length;
	//	const aPosTheta = new TvPosTheta();
	//	const aPosition = TvMapQueries.getLaneStartPosition( entry.road.id, entry.lane.id, as, 0, aPosTheta );
	//
	//	const bs = exit.contact === TvContactPoint.START ? 0 : exit.road.length;
	//	const bPosTheta = new TvPosTheta();
	//	const bPosition = TvMapQueries.getLaneStartPosition( exit.road.id, exit.lane.id, bs, 0, bPosTheta );
	//
	//	let a2: TvPosTheta;
	//	let b2: TvPosTheta;
	//
	//	const distance = aPosition.distanceTo( bPosition ) * 0.3;
	//
	//	if ( entry.contact === TvContactPoint.START && exit.contact === TvContactPoint.START ) {
	//
	//		a2 = aPosTheta.moveForward( -distance );
	//		b2 = bPosTheta.moveForward( -distance );
	//
	//	} else if ( entry.contact === TvContactPoint.START && exit.contact === TvContactPoint.END ) {
	//
	//		a2 = aPosTheta.moveForward( -distance );
	//		b2 = bPosTheta.moveForward( +distance );
	//
	//	} else if ( entry.contact === TvContactPoint.END && exit.contact === TvContactPoint.END ) {
	//
	//		a2 = aPosTheta.moveForward( +distance );
	//		b2 = bPosTheta.moveForward( +distance );
	//
	//	} else if ( entry.contact === TvContactPoint.END && exit.contact === TvContactPoint.START ) {
	//
	//		a2 = aPosTheta.moveForward( +distance );
	//		b2 = bPosTheta.moveForward( -distance );
	//
	//	}
	//
	//	return {
	//		side: laneSide,
	//		start: aPosition,
	//		startPos: aPosTheta,
	//		end: bPosition,
	//		endPos: bPosTheta,
	//		a2: a2,
	//		b2: b2,
	//	};
	//}

	getNewSpline () {

		return new AutoSplineV2();

	}

	/**
	 * creates a straight spline
	 * @param start
	 * @param length
	 * @param degrees
	 * @param type
	 */
	static createStraight ( start: Vector3, length = 100, degrees = 0, type: SplineType = SplineType.AUTOV2 ): AbstractSpline {

		const hdg = Maths.Deg2Rad * degrees;
		const direction = new Vector3( Math.cos( hdg ), Math.sin( hdg ), 0 );
		const secondPoint = start.clone().add( direction.clone().multiplyScalar( length ) );

		let spline: AbstractSpline;

		if ( type === SplineType.EXPLICIT ) {
			spline = new ExplicitSpline();
		} else {
			spline = new AutoSplineV2();
		}

		spline.controlPoints.push( ControlPointFactory.createControl( spline, start ) );
		spline.controlPoints.push( ControlPointFactory.createControl( spline, secondPoint ) );

		return spline;
	}

	static createExplicitSpline ( geometries: TvAbstractRoadGeometry[], road: TvRoad ): ExplicitSpline {

		function addControlPoint ( spline: ExplicitSpline, geometry: TvAbstractRoadGeometry, index: number, position: Vector3, hdg: number ) {

			const point = ControlPointFactory.createRoadControlPoint( road, geometry, index, position, hdg );

			spline.controlPoints.push( point );

		}

		const spline = new ExplicitSpline( road );

		if ( geometries.length === 0 ) return spline;

		let lastGeometry: TvAbstractRoadGeometry;

		for ( let i = 0; i < geometries.length; i++ ) {

			lastGeometry = geometries[ i ];

			spline.geometries.push( lastGeometry );

			addControlPoint( spline, lastGeometry, i, lastGeometry.startV3, lastGeometry.hdg );

		}

		const lastCoord = lastGeometry.endCoord();

		addControlPoint( spline, lastGeometry, geometries.length, lastCoord.toVector3(), lastCoord.hdg );

		spline.controlPoints.forEach( cp => cp.userData.roadId = road.id );

		spline.segmentMap.set( 0, road );

		road.sStart = 0;

		return spline;

	}

}
