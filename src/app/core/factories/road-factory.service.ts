/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvContactPoint, TvLaneSide, TvRoadType } from 'app/modules/tv-map/models/tv-common';
import { TvLaneSection } from 'app/modules/tv-map/models/tv-lane-section';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { Maths } from 'app/utils/maths';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { Vector3 } from 'three';
import { AppInspector } from '../inspector';
import { SceneService } from '../services/scene.service';
import { ExplicitSpline } from '../shapes/explicit-spline';
import { NodeFactoryService } from './node-factory.service';

export class RoadFactory {

	static get map () {
		return TvMapInstance.map;
	}

	static rebuildRoad ( road: TvRoad ) {

		this.map.gameObject.remove( road.gameObject );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

		if ( !road.isJunction ) road.updateRoadNodes();

	}

	static joinRoadNodes ( firstRoad: TvRoad, firstNode: RoadNode, secondRoad: TvRoad, secondNode: RoadNode ): TvRoad {

		const joiningRoad = this.map.addDefaultRoad();

		joiningRoad.clearLaneSections();

		joiningRoad.addLaneSectionInstance( firstNode.getLaneSection() );

		if ( firstRoad.hasType ) {

			const roadType = firstRoad.getRoadTypeAt( firstNode.sCoordinate );

			joiningRoad.setType( roadType.type, roadType.speed.max, roadType.speed.unit );

		} else {

			joiningRoad.setType( TvRoadType.TOWN, 40 );

		}

		// control points for joining road
		const firstPosition = firstNode.getPosition().toVector3();
		const secondPosition = firstNode.moveAway( 20 ).toVector3();
		const thirdPosition = firstNode.moveAway( 40 ).addLateralOffset( 5 ).toVector3();
		const fourthPosition = secondNode.moveAway( 40 ).addLateralOffset( 5 ).toVector3();
		const fifthPosition = secondNode.moveAway( 20 ).toVector3();
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

			firstRoad.setPredecessor( 'road', joiningRoad.id, TvContactPoint.START );
			firstRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
			} );

			joiningRoad.setPredecessor( 'road', firstRoad.id, TvContactPoint.START );
			joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( -lane.id );
			} );

		} else {

			// links will be in same direction

			firstRoad.setSuccessor( 'road', joiningRoad.id, TvContactPoint.START );
			firstRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
			} );

			joiningRoad.setPredecessor( 'road', firstRoad.id, TvContactPoint.END );
			joiningRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
			} );

		}

		if ( secondNode.distance === 'start' ) {

			secondRoad.setPredecessor( 'road', joiningRoad.id, TvContactPoint.END );
			secondRoad.getFirstLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
			} );

			joiningRoad.setSuccessor( 'road', secondRoad.id, TvContactPoint.START );
			joiningRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
			} );

		} else {

			secondRoad.setSuccessor( 'road', joiningRoad.id, TvContactPoint.END );
			secondRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
			} );

			joiningRoad.setSuccessor( 'road', secondRoad.id, TvContactPoint.END );
			joiningRoad.getLastLaneSection().lanes.forEach( lane => {
				if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( -lane.id );
			} );

		}
	}

	static makeSuccessorConnection ( firstRoad: TvRoad, secondRoad: TvRoad ) {

		firstRoad.setSuccessor( 'road', secondRoad.id, TvContactPoint.START );

		firstRoad.getLastLaneSection().lanes.forEach( lane => {
			if ( lane.side !== TvLaneSide.CENTER ) lane.setSuccessor( lane.id );
		} );

		secondRoad.setPredecessor( 'road', firstRoad.id, TvContactPoint.END );

		secondRoad.getFirstLaneSection().lanes.forEach( lane => {
			if ( lane.side !== TvLaneSide.CENTER ) lane.setPredecessor( lane.id );
		} );

	}

	static removeRoadConnections ( firstRoad: TvRoad, secondRoad: TvRoad ) {

		if ( firstRoad.predecessor && firstRoad.predecessor.elementId === secondRoad.id ) {

			firstRoad.predecessor = null;

		}

		if ( firstRoad.successor && firstRoad.successor.elementId === secondRoad.id ) {

			firstRoad.successor = null;

		}

		if ( secondRoad.predecessor && secondRoad.predecessor.elementId === firstRoad.id ) {

			secondRoad.predecessor = null;

		}

		if ( secondRoad.successor && secondRoad.successor.elementId === firstRoad.id ) {

			secondRoad.successor = null;

		}

	}
}
