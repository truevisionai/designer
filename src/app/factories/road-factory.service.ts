/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvLaneSide, TvLaneType, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadStyleManager } from 'app/managers/road-style.manager';
import { Vector3 } from 'three';
import { IDService } from './id.service';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { Injectable } from '@angular/core';
import { TvJunction } from "../modules/tv-map/models/junctions/tv-junction";

@Injectable( {
	providedIn: 'root'
} )
export class RoadFactory {

	public static instance: RoadFactory;

	private IDService = new IDService();

	constructor () {

		RoadFactory.instance = this;

	}

	getNextRoadId () {

		return this.IDService.getUniqueID();

	}

	//static cloneRoad ( road: TvRoad, s = 0 ): TvRoad {
	//
	//	const cloned = road.clone( s );
	//
	//	cloned.id = this.IDService.getUniqueID();
	//
	//	return cloned;
	//
	//}

	//static createFirstRoadControlPoint ( position: Vector3 ) {
	//
	//	const road = this.createDefaultRoad( TvRoadType.TOWN, 40 );
	//
	//	const point = road.addControlPointAt( position );
	//
	//	road.spline.addRoadSegment( 0, road.id );
	//
	//	return { point, road };
	//
	//}

	createRampRoad ( lane: TvLane ): TvRoad {

		const road = this.createNewRoad();

		// FIX: minor elevation to avoid z-fighting
		// road.addElevation( 0, 0.05, 0, 0, 0 );

		const roadStyle = RoadStyleManager.getRampRoadStyle( road, lane );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}

	createDefaultRoad ( type: TvRoadType = TvRoadType.TOWN, maxSpeed: number = 40 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = RoadStyleManager.getRoadStyle( road );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}

	createParkingRoad ( type: TvRoadType = TvRoadType.LOW_SPEED, maxSpeed: number = 10 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = RoadStyleManager.getParkingRoadStyle( road );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}


	createStraightRoad ( position: Vector3, hdg = 0, length = 10 ): TvRoad {

		const road = this.createDefaultRoad();

		road.addGeometryLine( 0, position.x, position.y, hdg, length );

		return road;

	}

	createSingleLaneRoad ( width = 3.6, side = TvLaneSide.RIGHT ): TvRoad {

		const road = this.createNewRoad();

		const laneSection = road.addGetLaneSection( 0 );

		if ( side === TvLaneSide.LEFT ) {
			laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );
		}

		if ( side === TvLaneSide.RIGHT ) {
			laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );
		}

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		laneSection.getLaneArray().forEach( lane => {

			if ( lane.side === TvLaneSide.CENTER ) return;

			if ( lane.type !== TvLaneType.driving ) return;

			lane.addWidthRecord( 0, width, 0, 0, 0 );

		} );

		return road;

	}

	createJoiningRoad ( firstNode: RoadNode, secondNode: RoadNode ): TvRoad {

		const road = this.createDefaultRoad();

		road.clearLaneSections();

		const laneSection = firstNode.getLaneSection().cloneAtS( 0, 0, null, road );

		road.addLaneSectionInstance( laneSection );

		if ( firstNode.road.hasType ) {

			const roadType = firstNode.road.getRoadTypeAt( firstNode.sCoordinate );

			road.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

		} else {

			road.setType( TvRoadType.TOWN, 40 );

		}

		return road;
	}

	createNewRoad ( name?: string, length?: number, id?: number, junction?: TvJunction ): TvRoad {

		const roadId = this.IDService.getUniqueID( id );

		const roadName = name || `Road${ roadId }`;

		const road = new TvRoad( roadName, length || 0, roadId, junction );

		road.sStart = 0;

		const spline = new AutoSplineV2();

		spline.addRoadSegment( road.sStart, road.id );

		road.spline = spline;

		return road;

	}

	//static removeRoad ( road: TvRoad ) {
	//
	//	this.map.gameObject.remove( road.gameObject );
	//
	//}

	//static createConnectingRoad ( entry: JunctionEntryObject, exit: JunctionEntryObject, side: TvLaneSide, junction: TvJunction ) {
	//
	//	const laneWidth = entry.lane.getWidthValue( 0 );
	//
	//	const spline = this.createSpline( entry, exit, side );
	//
	//	const connectingRoad = RoadFactory.addConnectingRoad( TvLaneSide.RIGHT, laneWidth, junction.id );
	//
	//	this.map.addRoad( connectingRoad );
	//
	//	connectingRoad.setPredecessor( TvRoadLinkChildType.road, entry.road.id, entry.contact );
	//
	//	connectingRoad.setSuccessor( TvRoadLinkChildType.road, exit.road.id, exit.contact );
	//
	//	// TODO: test this
	//	connectingRoad.laneSections.forEach( ( laneSection ) => {
	//
	//		laneSection.lanes.forEach( ( lane ) => {
	//
	//			lane.predecessor = entry.lane.id;
	//			lane.successor = exit.lane.id;
	//
	//		} );
	//	} );
	//
	//	connectingRoad.spline = spline;
	//
	//	connectingRoad.updateGeometryFromSpline();
	//
	//	connectingRoad.spline.hide();
	//
	//	return connectingRoad;
	//}

	//static addConnectingRoad ( side: TvLaneSide, width: number, junctionId: number ): TvRoad {
	//
	//	const id = this.IDService.getUniqueID();
	//
	//	const road = this.addRoad( `Road${ id }`, 0, id, junctionId );
	//
	//	const laneSection = road.addGetLaneSection( 0 );
	//
	//	if ( side === TvLaneSide.LEFT ) {
	//		laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );
	//	}
	//
	//	if ( side === TvLaneSide.RIGHT ) {
	//		laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );
	//	}
	//
	//	laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );
	//
	//	laneSection.getLaneArray().forEach( lane => {
	//
	//		if ( lane.side !== TvLaneSide.CENTER ) {
	//
	//			if ( lane.type === TvLaneType.driving ) lane.addWidthRecord( 0, width, 0, 0, 0 );
	//
	//		}
	//
	//	} );
	//
	//	return road;
	//}

	// static joinRoadNodes ( firstRoad: TvRoad, firstNode: RoadNode, secondRoad: TvRoad, secondNode: RoadNode ): TvRoad {

	// 	const joiningRoad = RoadFactory.createDefaultRoad();

	// 	joiningRoad.clearLaneSections();

	// 	const laneSection = firstNode.getLaneSection().cloneAtS( 0, 0, null, joiningRoad );

	// 	joiningRoad.addLaneSectionInstance( laneSection );

	// 	if ( firstRoad.hasType ) {

	// 		const roadType = firstRoad.getRoadTypeAt( firstNode.sCoordinate );

	// 		joiningRoad.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

	// 	} else {

	// 		joiningRoad.setType( TvRoadType.TOWN, 40 );

	// 	}

	// 	const nodeDistance = firstNode.getPosition().toVector3().distanceTo( secondNode.getPosition().toVector3() );
	// 	const d1 = nodeDistance * 0.1;
	// 	const d2 = nodeDistance * 0.3;

	// 	// control points for joining road
	// 	const firstPosition = firstNode.getPosition().toVector3();
	// 	const secondPosition = firstNode.moveAway( d1 ).toVector3();
	// 	const thirdPosition = firstNode.moveAway( d2 ).addLateralOffset( 1 ).toVector3();
	// 	const fourthPosition = secondNode.moveAway( d2 ).addLateralOffset( 1 ).toVector3();
	// 	const fifthPosition = secondNode.moveAway( d1 ).toVector3();
	// 	const lastPosition = secondNode.getPosition().toVector3();

	// 	joiningRoad.addControlPointAt( firstPosition );
	// 	joiningRoad.addControlPointAt( secondPosition );
	// 	joiningRoad.addControlPointAt( thirdPosition );
	// 	joiningRoad.addControlPointAt( fourthPosition );
	// 	joiningRoad.addControlPointAt( fifthPosition );
	// 	joiningRoad.addControlPointAt( lastPosition );

	// 	joiningRoad.updateGeometryFromSpline();

	// 	this.makeRoadConnections( firstRoad, firstNode, secondRoad, secondNode, joiningRoad );

	// 	TvMapBuilder.buildRoad( this.map.gameObject, joiningRoad );

	// 	return joiningRoad;
	// }

	//static makeRoadConnections ( firstRoad: TvRoad, firstNode: RoadNode, secondRoad: TvRoad, secondNode: RoadNode, joiningRoad: TvRoad ) {
	//
	//	if ( firstNode.contact === TvContactPoint.START ) {
	//
	//		// link will be negative as joining roaad will in opposite direction
	//
	//		firstRoad.setPredecessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.START );
	//		firstRoad.getFirstLaneSection().lanes.forEach( lane => {
	//			if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
	//		} );
	//
	//		joiningRoad.setPredecessor( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.START );
	//		joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
	//			if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
	//		} );
	//
	//	} else {
	//
	//		// links will be in same direction
	//
	//		firstRoad.setSuccessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.START );
	//		firstRoad.getLastLaneSection().lanes.forEach( lane => {
	//			if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
	//		} );
	//
	//		joiningRoad.setPredecessor( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.END );
	//		joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
	//			if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
	//		} );
	//
	//	}
	//
	//	if ( secondNode.contact === TvContactPoint.START ) {
	//
	//		secondRoad.setPredecessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.END );
	//		secondRoad.getFirstLaneSection().lanes.forEach( lane => {
	//			if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
	//		} );
	//
	//		joiningRoad.setSuccessor( TvRoadLinkChildType.road, secondRoad.id, TvContactPoint.START );
	//		joiningRoad.getLastLaneSection().lanes.forEach( lane => {
	//			if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
	//		} );
	//
	//	} else {
	//
	//		secondRoad.setSuccessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.END );
	//		secondRoad.getLastLaneSection().lanes.forEach( lane => {
	//			if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
	//		} );
	//
	//		joiningRoad.setSuccessor( TvRoadLinkChildType.road, secondRoad.id, TvContactPoint.END );
	//		joiningRoad.getLastLaneSection().lanes.forEach( lane => {
	//			if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
	//		} );
	//
	//	}
	//}

	// start position is always at the entry

	// static makeSuccessorConnection ( firstRoad: TvRoad, secondRoad: TvRoad ) {
	//
	//     firstRoad.setSuccessor( TvRoadLinkChildType.road, secondRoad.id, TvContactPoint.START );
	//
	//     firstRoad.getLastLaneSection().lanes.forEach( lane => {
	//         if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
	//     } );
	//
	//     secondRoad.setPredecessor( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.END );
	//
	//     secondRoad.getFirstLaneSection().lanes.forEach( lane => {
	//         if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
	//     } );
	//
	// }

	//private static addRoad ( name: string, length: number, id: number, junction: number ): TvRoad {
	//
	//	const road = new TvRoad( name, length, id, junction );
	//
	//	this.map.roads.set( road.id, road );
	//
	//	return road;
	//}

	//private static createSpline ( entry, exit, side ) {
	//
	//	const nodes = this.getSplinePositions( entry, exit, side );
	//
	//	const spline = new AutoSpline();
	//
	//	SceneService.addToMain( spline.addControlPointAt( nodes.start ) );
	//	SceneService.addToMain( spline.addControlPointAt( nodes.a2.toVector3() ) );
	//	SceneService.addToMain( spline.addControlPointAt( nodes.b2.toVector3() ) );
	//	SceneService.addToMain( spline.addControlPointAt( nodes.end ) );
	//
	//	spline.controlPoints.forEach( ( cp: RoadControlPoint ) => cp.allowChange = false );
	//
	//	return spline;
	//}

	// end position is always at the exit
	//private static getSplinePositions ( entry: JunctionEntryObject, exit: JunctionEntryObject, laneSide: TvLaneSide ) {
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

}
