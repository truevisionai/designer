/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvContactPoint, TvLaneSide, TvLaneType, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoadLinkChild, TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { RoadStyleManager } from 'app/managers/road-style.manager';
import { Vector2, Vector3 } from 'three';
import { JunctionEntryObject } from '../modules/three-js/objects/junction-entry.object';
import { RoadControlPoint } from '../modules/three-js/objects/road-control-point';
import { TvJunction } from '../modules/tv-map/models/tv-junction';
import { TvPosTheta } from '../modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../modules/tv-map/queries/tv-map-queries';
import { SceneService } from '../services/scene.service';
import { AutoSpline } from '../core/shapes/auto-spline';
import { IDService } from './id.service';
import { Maths } from 'app/utils/maths';

export class RoadFactory {

	private static IDService = new IDService();

	static get map () {

		return TvMapInstance.map;

	}

	static reset () {

		this.IDService = new IDService();

	}

	static createCircularRoads ( centre: Vector3, end: Vector3, radius: number ): TvRoad[] {

		const p1 = new Vector2( centre.x, centre.y );
		const p2 = new Vector2( end.x, end.y );

		let start = end;

		let hdg = new Vector2().subVectors( p2, p1 ).angle() + Maths.M_PI_2;

		const circumference = 2 * Math.PI * radius;

		const arcLength = circumference * 0.25;

		const curvature = 1 / radius;

		const points = []

		const roads = [];

		for ( let i = 0; i < 4; i++ ) {

			const road = roads[ i ] = this.map.addDefaultRoad();

			const arc = road.addGeometryArc( 0, start.x, start.y, hdg, arcLength, curvature );

			const startPosTheta = arc.getRoadCoord( 0 );
			const endPosTheta = arc.getRoadCoord( arcLength );

			const distance = start.distanceTo( arc.endV3 ) * 0.3;

			let a2 = startPosTheta.moveForward( +distance );
			let b2 = endPosTheta.moveForward( -distance );

			points.push( new RoadControlPoint( road, start, 'cp', 0, 0 ) );
			points.push( new RoadControlPoint( road, a2.toVector3(), 'cp', 1, 1 ) );
			points.push( new RoadControlPoint( road, b2.toVector3(), 'cp', 2, 2 ) );
			points.push( new RoadControlPoint( road, arc.endV3.clone(), 'cp', 3, 3 ) );

			start = arc.endV3;

			hdg += Maths.M_PI_2;

		}

		if ( roads.length != 4 ) throw new Error( 'Road count for circular road is incorrect' );

		if ( points.length != 16 ) throw new Error( 'Point count for circular road is incorrect' );

		points.forEach( p => SceneService.addToolObject( p ) );

		for ( let j = 0; j < 4; j++ ) {

			const road = roads[ j ];

			const spline = new AutoSpline( road );

			spline.addControlPoint( points[ j * 4 + 0 ] );
			spline.addControlPoint( points[ j * 4 + 1 ] );
			spline.addControlPoint( points[ j * 4 + 2 ] );
			spline.addControlPoint( points[ j * 4 + 3 ] );

			road.spline = spline;

			road.spline.hide();

			road.updateGeometryFromSpline();

			if ( ( j + 1 ) < roads.length ) {

				const nextRoad = roads[ j + 1 ];

				const successor = new TvRoadLinkChild( TvRoadLinkChildType.road, nextRoad.id, TvContactPoint.START );
				const predecessor = new TvRoadLinkChild( TvRoadLinkChildType.road, road.id, TvContactPoint.END );

				road.addSuccessor( successor );
				nextRoad.addPredecessor( predecessor );

			} else {

				// its last road, so make connection with the first one
				const firstRoad = roads[ 0 ];

				const successor = new TvRoadLinkChild( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.START );
				const predecessor = new TvRoadLinkChild( TvRoadLinkChildType.road, road.id, TvContactPoint.END );

				road.addSuccessor( successor );
				firstRoad.addPredecessor( predecessor );

			}

		}

		return roads;
	}

	static createFirstRoadControlPoint ( position: Vector3 ): RoadControlPoint {

		const road = this.createDefaultRoad( TvRoadType.TOWN, 40 );

		const point = road.addControlPointAt( position );

		return point;

	}

	static createRoadControlPoint ( road: TvRoad, position: Vector3 ): RoadControlPoint {

		return new RoadControlPoint( road, position, 'cp', road.spline.controlPoints.length, road.spline.controlPoints.length );

	}

	static createRampRoad ( lane: TvLane ): TvRoad {

		const road = this.createNewRoad();

		// FIX: minor elevation to avoid z-fighting
		// road.addElevation( 0, 0.05, 0, 0, 0 );

		const roadStyle = RoadStyleManager.getRampRoadStyle( road, lane );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}

	static createDefaultRoad ( type: TvRoadType = TvRoadType.TOWN, maxSpeed: number = 40 ): TvRoad {

		const road = this.createNewRoad();

		road.setType( type, maxSpeed );

		const roadStyle = RoadStyleManager.getRoadStyle( road );

		road.addLaneOffsetInstance( roadStyle.laneOffset );

		road.addLaneSectionInstance( roadStyle.laneSection );

		return road;

	}

	static createNewRoad ( name?: string, length?: number, id?: number, junctionId?: number ): TvRoad {

		const roadId = this.IDService.getUniqueID( id );

		const roadName = name || `Road${ roadId }`;

		return new TvRoad( roadName, length || 0, roadId, junctionId || -1 );

	}

	static rebuildRoad ( road: TvRoad ) {

		SceneService.removeFromMain( road.gameObject, true );

		this.map.gameObject.remove( road.gameObject );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

		if ( !road.isJunction ) road.updateRoadNodes();

	}

	static removeRoad ( road: TvRoad ) {

		this.map.gameObject.remove( road.gameObject );

	}

	static createConnectingRoad ( entry: JunctionEntryObject, exit: JunctionEntryObject, side: TvLaneSide, junction: TvJunction ) {

		const laneWidth = entry.lane.getWidthValue( 0 );

		const spline = this.createSpline( entry, exit, side );

		const connectingRoad = this.map.addConnectingRoad( TvLaneSide.RIGHT, laneWidth, junction.id );

		connectingRoad.setPredecessor( TvRoadLinkChildType.road, entry.road.id, entry.contact );

		connectingRoad.setSuccessor( TvRoadLinkChildType.road, exit.road.id, exit.contact );

		// TODO: test this
		connectingRoad.laneSections.forEach( ( laneSection ) => {

			laneSection.lanes.forEach( ( lane ) => {

				lane.predecessor = entry.lane.id;
				lane.successor = exit.lane.id;

			} );
		} );

		connectingRoad.spline = spline;

		connectingRoad.updateGeometryFromSpline();

		connectingRoad.spline.hide();

		return connectingRoad;
	}

	static addConnectingRoad ( side: TvLaneSide, width: number, junctionId: number ): TvRoad {

		const id = this.IDService.getUniqueID();

		const road = this.addRoad( `Road${ id }`, 0, id, junctionId );

		const laneSection = road.addGetLaneSection( 0 );

		if ( side === TvLaneSide.LEFT ) {
			laneSection.addLane( TvLaneSide.LEFT, 1, TvLaneType.driving, false, true );
		}

		if ( side === TvLaneSide.RIGHT ) {
			laneSection.addLane( TvLaneSide.RIGHT, -1, TvLaneType.driving, false, true );
		}

		laneSection.addLane( TvLaneSide.CENTER, 0, TvLaneType.driving, false, true );

		laneSection.getLaneArray().forEach( lane => {

			if ( lane.side !== TvLaneSide.CENTER ) {

				if ( lane.type === TvLaneType.driving ) lane.addWidthRecord( 0, width, 0, 0, 0 );

			}

		} );

		return road;
	}

	static joinRoadNodes ( firstRoad: TvRoad, firstNode: RoadNode, secondRoad: TvRoad, secondNode: RoadNode ): TvRoad {

		const joiningRoad = this.map.addDefaultRoad();

		joiningRoad.clearLaneSections();

		const laneSection = firstNode.getLaneSection().cloneAtS( 0, 0, null, joiningRoad );

		joiningRoad.addLaneSectionInstance( laneSection );

		if ( firstRoad.hasType ) {

			const roadType = firstRoad.getRoadTypeAt( firstNode.sCoordinate );

			joiningRoad.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

		} else {

			joiningRoad.setType( TvRoadType.TOWN, 40 );

		}

		const nodeDistance = firstNode.getPosition().toVector3().distanceTo( secondNode.getPosition().toVector3() );
		const d1 = nodeDistance * 0.1;
		const d2 = nodeDistance * 0.3;

		// control points for joining road
		const firstPosition = firstNode.getPosition().toVector3();
		const secondPosition = firstNode.moveAway( d1 ).toVector3();
		const thirdPosition = firstNode.moveAway( d2 ).addLateralOffset( 1 ).toVector3();
		const fourthPosition = secondNode.moveAway( d2 ).addLateralOffset( 1 ).toVector3();
		const fifthPosition = secondNode.moveAway( d1 ).toVector3();
		const lastPosition = secondNode.getPosition().toVector3();

		joiningRoad.addControlPointAt( firstPosition );
		joiningRoad.addControlPointAt( secondPosition );
		joiningRoad.addControlPointAt( thirdPosition );
		joiningRoad.addControlPointAt( fourthPosition );
		joiningRoad.addControlPointAt( fifthPosition );
		joiningRoad.addControlPointAt( lastPosition );

		joiningRoad.updateGeometryFromSpline();

		this.makeRoadConnections( firstRoad, firstNode, secondRoad, secondNode, joiningRoad );

		TvMapBuilder.buildRoad( this.map.gameObject, joiningRoad );

		return joiningRoad;
	}

	static makeRoadConnections ( firstRoad: TvRoad, firstNode: RoadNode, secondRoad: TvRoad, secondNode: RoadNode, joiningRoad: TvRoad ) {

		if ( firstNode.contact === TvContactPoint.START ) {

			// link will be negative as joining roaad will in opposite direction

			firstRoad.setPredecessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.START );
			firstRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
			} );

			joiningRoad.setPredecessor( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.START );
			joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
			} );

		} else {

			// links will be in same direction

			firstRoad.setSuccessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.START );
			firstRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
			} );

			joiningRoad.setPredecessor( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.END );
			joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
			} );

		}

		if ( secondNode.contact === TvContactPoint.START ) {

			secondRoad.setPredecessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.END );
			secondRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
			} );

			joiningRoad.setSuccessor( TvRoadLinkChildType.road, secondRoad.id, TvContactPoint.START );
			joiningRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
			} );

		} else {

			secondRoad.setSuccessor( TvRoadLinkChildType.road, joiningRoad.id, TvContactPoint.END );
			secondRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
			} );

			joiningRoad.setSuccessor( TvRoadLinkChildType.road, secondRoad.id, TvContactPoint.END );
			joiningRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
			} );

		}
	}

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

	private static addRoad ( name: string, length: number, id: number, junction: number ): TvRoad {

		const road = new TvRoad( name, length, id, junction );

		this.map.roads.set( road.id, road );

		return road;
	}

	private static createSpline ( entry, exit, side ) {

		const nodes = this.getSplinePositions( entry, exit, side );

		const spline = new AutoSpline();

		SceneService.addToMain( spline.addControlPointAt( nodes.start ) );
		SceneService.addToMain( spline.addControlPointAt( nodes.a2.toVector3() ) );
		SceneService.addToMain( spline.addControlPointAt( nodes.b2.toVector3() ) );
		SceneService.addToMain( spline.addControlPointAt( nodes.end ) );

		spline.controlPoints.forEach( ( cp: RoadControlPoint ) => cp.allowChange = false );

		return spline;
	}

	// end position is always at the exit
	private static getSplinePositions ( entry: JunctionEntryObject, exit: JunctionEntryObject, laneSide: TvLaneSide ) {

		const as = entry.contact === TvContactPoint.START ? 0 : entry.road.length;
		const aPosTheta = new TvPosTheta();
		const aPosition = TvMapQueries.getLaneStartPosition( entry.road.id, entry.lane.id, as, 0, aPosTheta );

		const bs = exit.contact === TvContactPoint.START ? 0 : exit.road.length;
		const bPosTheta = new TvPosTheta();
		const bPosition = TvMapQueries.getLaneStartPosition( exit.road.id, exit.lane.id, bs, 0, bPosTheta );

		let a2: TvPosTheta;
		let b2: TvPosTheta;

		const distance = aPosition.distanceTo( bPosition ) * 0.3;

		if ( entry.contact === TvContactPoint.START && exit.contact === TvContactPoint.START ) {

			a2 = aPosTheta.moveForward( -distance );
			b2 = bPosTheta.moveForward( -distance );

		} else if ( entry.contact === TvContactPoint.START && exit.contact === TvContactPoint.END ) {

			a2 = aPosTheta.moveForward( -distance );
			b2 = bPosTheta.moveForward( +distance );

		} else if ( entry.contact === TvContactPoint.END && exit.contact === TvContactPoint.END ) {

			a2 = aPosTheta.moveForward( +distance );
			b2 = bPosTheta.moveForward( +distance );

		} else if ( entry.contact === TvContactPoint.END && exit.contact === TvContactPoint.START ) {

			a2 = aPosTheta.moveForward( +distance );
			b2 = bPosTheta.moveForward( -distance );

		}

		return {
			side: laneSide,
			start: aPosition,
			startPos: aPosTheta,
			end: bPosition,
			endPos: bPosTheta,
			a2: a2,
			b2: b2,
		};
	}

}
