/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadNode } from 'app/objects/road-node';
import { TvContactPoint, TvLaneSide, TvLaneType, TvRoadType } from 'app/map/models/tv-common';
import { TvLane } from 'app/map/models/tv-lane';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadStyleManager } from 'app/graphics/road-style/road-style.manager';
import { Vector2, Vector3 } from 'three';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { Injectable } from '@angular/core';
import { TvJunction } from "../map/models/junctions/tv-junction";
import { TvElevationProfile } from 'app/map/road-elevation/tv-elevation-profile.model';
import { TvUtils } from 'app/map/models/tv-utils';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { LaneSectionFactory } from './lane-section.factory';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { TvRoadLink, TvRoadLinkType } from 'app/map/models/tv-road-link';
import { MapService } from "../services/map/map.service";
import { ControlPointFactory } from "./control-point.factory";

@Injectable( {
	providedIn: 'root'
} )
export class RoadFactory {

	constructor (
		private mapService: MapService,
		private laneSectionFactory: LaneSectionFactory,
		private roadStyleManager: RoadStyleManager
	) {
	}

	getNextRoadId ( id?: number ) {

		return this.mapService.map.roads.next();

	}

	setCounter ( id: number ) {

		// this.mapService.map.roads.add( id );

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

	createRampRoad ( lane?: TvLane ): TvRoad {

		const road = this.createNewRoad();

		// FIX: minor elevation to avoid z-fighting
		// road.getElevationProfile().addElevation( 0, 0.05, 0, 0, 0 );

		const roadStyle = this.roadStyleManager.getRampRoadStyle( road, lane );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}

	createDefaultRoad ( type: TvRoadType = TvRoadType.TOWN, maxSpeed: number = 40 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = this.roadStyleManager.getRoadStyle( road );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		road.addElevationProfile( roadStyle.elevationProfile );

		return road;

	}

	createHighwayRoad ( type: TvRoadType = TvRoadType.MOTORWAY, maxSpeed: number = 40 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const laneSection = road.addGetLaneSection( 0 );

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.none, false, true );
		laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.sidewalk, false, true ).addWidthRecord( 0, 3.6, 0, 0, 0 );
		laneSection.addLane( TvLaneSide.RIGHT, -2, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );
		laneSection.addLane( TvLaneSide.RIGHT, -3, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );
		laneSection.addLane( TvLaneSide.RIGHT, -4, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );
		laneSection.addLane( TvLaneSide.RIGHT, -5, TvLaneType.driving, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );
		laneSection.addLane( TvLaneSide.RIGHT, -6, TvLaneType.sidewalk, false, true ).addWidthRecord( 0, 3.5, 0, 0, 0 );

		return road;

	}

	createParkingRoad ( type: TvRoadType = TvRoadType.LOW_SPEED, maxSpeed: number = 10 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = this.roadStyleManager.getParkingRoadStyle( road );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}

	createFromControlPoints ( controlPoints: Vector2[], type: TvRoadType = TvRoadType.TOWN, maxSpeed: number = 40 ): TvRoad {

		const road = this.createDefaultRoad( type, maxSpeed );

		controlPoints.forEach( value => {

			const position = new Vector3( value.x, value.y, 0 );

			const point = ControlPointFactory.createControl( road.spline, position );

			road.spline.controlPoints.push( point );

		} );

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

	createRoadWithLaneCount ( leftCount = 1, rightCount = 1, leftWidth = 3.6, rightWidth = 3.6 ): TvRoad {

		const road = this.createNewRoad();

		const laneSection = road.addGetLaneSection( 0 );

		for ( let i = 1; i <= leftCount; i++ ) {

			const lane = laneSection.addLane( TvLaneSide.LEFT, i, TvLaneType.driving, false, true );

			lane.addWidthRecord( 0, leftWidth, 0, 0, 0 );

		}

		for ( let i = 1; i <= rightCount; i++ ) {

			const lane = laneSection.addLane( TvLaneSide.RIGHT, -i, TvLaneType.driving, false, true );

			lane.addWidthRecord( 0, rightWidth, 0, 0, 0 );

		}

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		return road;

	}

	createJoiningRoad ( spline: AbstractSpline, firstNode: RoadNode, secondNode: RoadNode ): TvRoad {

		const road = this.createDefaultRoad();

		road.spline = spline;

		road.length = spline.getLength();

		road.clearLaneSections();

		const laneSections = this.laneSectionFactory.createFromRoadNode( road, firstNode, secondNode );

		for ( const laneSection of laneSections ) {

			road.addLaneSectionInstance( laneSection );

		}

		if ( firstNode.road.hasType ) {

			const s = firstNode.contact === TvContactPoint.START ? 0 : firstNode.road.length;

			const roadType = firstNode.road.getRoadTypeAt( s );

			road.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

		} else {

			road.setType( TvRoadType.TOWN, 40 );

		}

		return road;
	}

	createFromLinks ( spline: AbstractSpline, firstNode: TvRoadLink, secondNode: TvRoadLink ): TvRoad {

		const road = this.createDefaultRoad();

		road.spline = spline;

		road.length = spline.getLength();

		road.clearLaneSections();

		const laneSections = this.laneSectionFactory.createFromRoadLink( road, firstNode, secondNode );

		for ( const laneSection of laneSections ) {

			road.addLaneSectionInstance( laneSection );

		}

		const firstRoad = firstNode.element as TvRoad;

		if ( firstRoad.hasType ) {

			const s = firstNode.contactPoint === TvContactPoint.START ? 0 : firstRoad.length;

			const roadType = firstRoad.getRoadTypeAt( s );

			road.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

		} else {

			road.setType( TvRoadType.TOWN, 40 );

		}

		return road;
	}

	private computeElevationProfile (
		roadLength: number,
		firstRoad: TvRoad,
		firstS: number,
		secondRoad: TvRoad,
		secondS: number
	): TvElevationProfile {

		const profile = new TvElevationProfile();

		const startElevation = firstRoad.getElevationProfile().getElevationValue( firstS )
		const endElevation = secondRoad.getElevationProfile().getElevationValue( secondS );

		profile.addElevation( 0, startElevation, 0, 0, 0 );
		profile.addElevation( roadLength, endElevation, 0, 0, 0 );

		TvUtils.computeCoefficients( profile.getElevations(), roadLength );

		return profile;
	}

	createNewRoad ( name?: string, length?: number, id?: number, junction?: TvJunction ): TvRoad {

		const roadId = this.getNextRoadId( id );

		const roadName = name || `Road${ roadId }`;

		const road = new TvRoad( roadName, length || 0, roadId, junction );

		road.sStart = 0;

		const spline = new AutoSplineV2();

		spline.segmentMap.set( 0, road );

		road.spline = spline;

		return road;

	}

	createFakeRoad ( name?: string, length?: number, junction?: TvJunction ): TvRoad {

		const roadId = -1;

		const roadName = name || `Road${ roadId }`;

		const road = new TvRoad( roadName, length || 0, roadId, junction );

		road.sStart = 0;

		return road;

	}

	createConnectingRoad ( junction: TvJunction, entry: TvLaneCoord, exit: TvLaneCoord ): TvRoad {

		const road = this.createNewRoad();

		road.junction = junction;

		road.setPredecessor( TvRoadLinkType.ROAD, entry.road, entry.contact );

		road.setSuccessor( TvRoadLinkType.ROAD, exit.road, exit.contact );

		return road;

	}

	//static removeRoad ( road: TvRoad ) {
	//
	//	this.models.gameObject.remove( road.gameObject );
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
	//	this.models.addRoad( connectingRoad );
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

	// 	TvMapBuilder.buildRoad( this.models.gameObject, joiningRoad );

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
	//	this.models.roads.set( road.id, road );
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
