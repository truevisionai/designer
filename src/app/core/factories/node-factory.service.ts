/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { AnyControlPoint, LaneOffsetNode, LaneRoadMarkNode, LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from 'app/modules/tv-map/models/tv-lane-road-mark';
import { TvLaneWidth } from 'app/modules/tv-map/models/tv-lane-width';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { SnackBar } from 'app/services/snack-bar.service';
import { COLOR } from 'app/shared/utils/colors.service';
import { Maths } from 'app/utils/maths';
import { BufferGeometry, LineBasicMaterial, LineSegments, Vector3 } from 'three';
import { SceneService } from '../services/scene.service';


@Injectable( {
	providedIn: 'root'
} )
export class NodeFactoryService {

	constructor () {
	}

	static createLaneWidthNodeByPosition ( road: TvRoad, lane: TvLane, point: Vector3 ): LaneWidthNode {

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		TvMapQueries.getRoadByCoords( point.x, point.y, posTheta );

		// get the exisiting lane width at s
		// and clone the lane width
		const laneWidth = lane.getLaneWidthAt( posTheta.s ).clone( posTheta.s );

		// add the with back to lane to
		lane.addWidthRecordInstance( laneWidth );

		// make mesh for the lane width node
		return laneWidth.mesh = this.createLaneWidthNode( road, lane, laneWidth.s, laneWidth );
	}

	static createLaneWidthNode ( road: TvRoad, lane: TvLane, s: number, laneWidth: TvLaneWidth ): LaneWidthNode {

		const node = new LaneWidthNode( road, lane, s, laneWidth );

		const offset = laneWidth.getValue( s ) * 0.5;

		const start = TvMapQueries.getLanePosition( road.id, lane.id, s, -offset );
		const end = TvMapQueries.getLanePosition( road.id, lane.id, s, offset );

		/////////////////////////////////////////

		node.point = AnyControlPoint.create( 'point', end );

		node.point.tag = LaneWidthNode.pointTag;

		node.add( node.point );

		/////////////////////////////////////////

		const lineGeometry = new BufferGeometry().setFromPoints( [ start, end ] );

		node.line = new LineSegments( lineGeometry, new LineBasicMaterial( { color: COLOR.DARKBLUE, opacity: 0.35 } ) );

		node.line[ 'tag' ] = LaneWidthNode.lineTag;

		node.line.renderOrder = 3;

		node.add( node.line );

		//////////////////////////////////////////

		// group.position.copy( center );

		return node;
	}

	// update s value of lane-width as per the restriction
	static updateLaneWidthNode ( node: LaneWidthNode, point: Vector3, direction = 'sCoordinate' ): void {

		const index = node.lane.getLaneWidthVector().findIndex( i => i.uuid === node.laneWidth.uuid );

		if ( index === -1 ) SnackBar.error( 'Unexpected error. Not able to find this node' );
		if ( index === -1 ) return;

		if ( index === 0 ) SnackBar.warn( 'First node cannot be edited. Please add a new node.' );
		if ( index === 0 ) return;

		const minS = node.lane.width[ index - 1 ].s + 0.1;

		// TODO: mke this the max s value as per lane section
		let maxS = Number.MAX_SAFE_INTEGER;

		if ( index + 1 < node.lane.width.length ) {

			maxS = node.lane.width[ index + 1 ].s - 0.1;

		}

		const newPosition = new TvPosTheta();

		const road = TvMapQueries.getRoadByCoords( point.x, point.y, newPosition );

		// we are getting another road s value to ignore
		if ( node.lane.roadId !== road.id ) return;

		// our desired s value should lie between the previous node and the next node
		const adjustedS = Maths.clamp( newPosition.s, minS, maxS );

		// update s offset as per the new position on road
		node.laneWidth.s = adjustedS;

		// const offset = node.lane.getWidthValue( adjustedS ) * 0.5;

		const offset = node.laneWidth.getValue( adjustedS ) * 0.5;

		let sCoordinate = null;

		if ( direction === 'sCoordinate' ) {

			sCoordinate = adjustedS;

		} else if ( direction === 'tCoordinate' ) {

			sCoordinate = node.s;

		}

		const start = TvMapQueries.getLanePosition( node.roadId, node.laneId, sCoordinate, -offset );
		const end = TvMapQueries.getLanePosition( node.roadId, node.laneId, sCoordinate, offset );


		// TODO: can be improved
		node.line.geometry.dispose();
		node.line.geometry = new BufferGeometry().setFromPoints( [ start, end ] );

		node.point.position.copy( end );

		node.s = node.laneWidth.s = adjustedS;

		// const roadPos = new OdPosTheta();
		// const lanePos = new OdPosTheta();

		// // this gets the road and the s and t values
		// // const road = OpenDriveQueries.getRoadByCoords( point.x, point.y, roadPos );

		// // this get the lane from road, s and t values
		// // roadPos is only used to read
		// // const result = OpenDriveQueries.getLaneByCoords( position.x, position.y, roadPos );

		// if ( node.s < 0.1 ) return;

		// if ( road ) {

		//     let finalPosition = null;
		//     let sCoordinate = null;

		//     if ( direction == 'sCoordinate' ) {

		//         sCoordinate = roadPos.s;

		//     } else if ( direction == 'tCoordinate' ) {

		//         sCoordinate = node.s;

		//     }

		//     const offset = laneWidth.getValue( roadPos.s ) * 0.5;

		//     const start = OpenDriveQueries.getLanePosition( node.roadId, node.laneId, sCoordinate, -offset );
		//     const end = OpenDriveQueries.getLanePosition( node.roadId, node.laneId, sCoordinate, offset );

		//     // TODO: can be improved
		//     node.line.geometry.dispose();
		//     node.line.geometry = new BufferGeometry().setFromPoints( [ start, end ] )

		//     node.point.position.copy( end );

		//     node.s = node.laneWidth.s = roadPos.s;
		// }
	}

	/**
	 * Updates the lane width line position
	 * @param node LaneWidthNode
	 */
	static updateLaneWidthNodeLine ( node: LaneWidthNode ) {

		const laneWidth = node.laneWidth;

		if ( node.s < 0 ) node.s = 0;

		const offset = laneWidth.getValue( node.s ) * 0.5;

		const start = TvMapQueries.getLanePosition( node.roadId, node.laneId, node.s, -offset );
		const end = TvMapQueries.getLanePosition( node.roadId, node.laneId, node.s, offset );

		// TODO: can be improved
		node.line.geometry.dispose();
		node.line.geometry = new BufferGeometry().setFromPoints( [ start, end ] );

		node.point.position.copy( end );
	}

	static createLaneOffsetNode ( road: TvRoad, laneOffset: TvRoadLaneOffset ): LaneOffsetNode {

		const node = new LaneOffsetNode( road, laneOffset );

		const offset = laneOffset.getValue( laneOffset.s );

		const start = TvMapQueries.findRoadById( road.id ).getPositionAt( laneOffset.s, 0 );

		// const end = OpenDriveQueries.findRoadById( roadId ).getPositionAt( s, 0 );

		/////////////////////////////////////////

		node.point = AnyControlPoint.create( 'point', start.toVector3() );

		node.point.tag = LaneOffsetNode.pointTag;

		node.add( node.point );

		/////////////////////////////////////////

		// const lineGeometry = new BufferGeometry().setFromPoints( [ start, end ] );

		// node.line = new LineSegments( lineGeometry, new LineBasicMaterial( { color: COLOR.DARKBLUE, opacity: 0.35 } ) );

		// node.line[ 'tag' ] = LaneOffsetNode.lineTag;

		// node.line.renderOrder = 3;

		// node.add( node.line );

		//////////////////////////////////////////

		// group.position.copy( center );

		return node;
	}

	/**
	 * Updates the position of the node
	 * @param node
	 */
	static updateLaneOffsetNode ( node: LaneOffsetNode ): LaneOffsetNode {

		const offset = node.laneOffset.getValue( node.laneOffset.s );

		const position = TvMapQueries.findRoadById( node.roadId ).getPositionAt( node.laneOffset.s, 0 );

		node.point.copyPosition( position.toVector3() );

		return node;
	}

	static createRoadMarkNode ( lane: TvLane, roadmark: TvLaneRoadMark ): LaneRoadMarkNode {

		const node = new LaneRoadMarkNode( lane, roadmark );

		const offset = lane.getWidthValue( roadmark.s ) * 0.5;

		const position = TvMapQueries.getLanePosition( lane.roadId, lane.id, roadmark.s, offset );

		node.point = AnyControlPoint.create( 'point', position );

		node.point.tag = LaneRoadMarkNode.pointTag;

		node.add( node.point );

		return node;
	}

	static updateRoadMarkNodeByPosition ( node: LaneRoadMarkNode, point: Vector3 ) {

		const index = node.lane.getRoadMarks().findIndex( roadmark => roadmark.uuid === node.roadmark.uuid );

		if ( index === -1 ) SnackBar.error( 'Unexpected error. Not able to find this node' );
		if ( index === -1 ) return node;

		if ( index === 0 ) SnackBar.error( 'First node cannot be edited. Please add a new node.' );
		if ( index === 0 ) return node;

		const minS = node.lane.roadMark[ index - 1 ].s + 0.1;

		// TODO: mke this the max s value as per lane section
		let maxS = Number.MAX_SAFE_INTEGER;

		if ( index + 1 < node.lane.roadMark.length ) {

			maxS = node.lane.roadMark[ index + 1 ].s - 0.1;

		}

		const newPosition = new TvPosTheta();

		const road = TvMapQueries.getRoadByCoords( point.x, point.y, newPosition );

		// we are getting another road s value to ignore
		if ( node.lane.roadId !== road.id ) return node;

		// our desired s value should lie between the previous node and the next node
		const adjustedS = Maths.clamp( newPosition.s, minS, maxS );

		// update s offset as per the new position on road
		node.roadmark.sOffset = adjustedS;

		const offset = node.lane.getWidthValue( adjustedS ) * 0.5;

		const finalPosition = TvMapQueries.getLanePosition( node.lane.roadId, node.lane.id, adjustedS, offset );

		node.point.copyPosition( finalPosition );

		return node;
	}
}
