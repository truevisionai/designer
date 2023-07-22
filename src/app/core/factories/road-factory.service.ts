/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvContactPoint, TvLaneSide, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { JunctionEntryObject } from '../../modules/three-js/objects/junction-entry.object';
import { RoadControlPoint } from '../../modules/three-js/objects/road-control-point';
import { TvJunction } from '../../modules/tv-map/models/tv-junction';
import { TvPosTheta } from '../../modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { SceneService } from '../services/scene.service';
import { AutoSpline } from '../shapes/auto-spline';
import { TvRoadLinkChildType } from 'app/modules/tv-map/models/tv-road-link-child';

export class RoadFactory {

	static get map () {
		return TvMapInstance.map;
	}

	static rebuildRoad ( road: TvRoad ) {

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
		} )

		connectingRoad.spline = spline;

		connectingRoad.updateGeometryFromSpline();

		connectingRoad.spline.hide();

		return connectingRoad;
	}

	private static createSpline ( entry, exit, side ) {

		const nodes = this.getSplinePositions( entry, exit, side );

		const spline = new AutoSpline();

		SceneService.add( spline.addControlPointAt( nodes.start ) );
		SceneService.add( spline.addControlPointAt( nodes.a2.toVector3() ) );
		SceneService.add( spline.addControlPointAt( nodes.b2.toVector3() ) );
		SceneService.add( spline.addControlPointAt( nodes.end ) );

		spline.controlPoints.forEach( ( cp: RoadControlPoint ) => cp.allowChange = false );

		return spline;
	}

	// start position is always at the entry
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

		if ( firstNode.distance === 'start' ) {

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

		if ( secondNode.distance === 'start' ) {

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

	static makeSuccessorConnection ( firstRoad: TvRoad, secondRoad: TvRoad ) {

		firstRoad.setSuccessor( TvRoadLinkChildType.road, secondRoad.id, TvContactPoint.START );

		firstRoad.getLastLaneSection().lanes.forEach( lane => {
			if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
		} );

		secondRoad.setPredecessor( TvRoadLinkChildType.road, firstRoad.id, TvContactPoint.END );

		secondRoad.getFirstLaneSection().lanes.forEach( lane => {
			if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
		} );

	}

}
