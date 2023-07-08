/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { SnackBar } from 'app/services/snack-bar.service';
import { BufferGeometry, Vector3 } from 'three';
import { LaneOffsetNode } from '../../modules/three-js/objects/lane-offset-node';
import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';


@Injectable( {
	providedIn: 'root'
} )
export class NodeFactoryService {

	constructor () {
	}

	static createLaneWidthNodeByPosition ( road: TvRoad, lane: TvLane, point: Vector3 ): LaneWidthNode {

		const roadCoord = road.getCoordAt( point );

		const laneWidth = lane.getLaneWidthAt( roadCoord.s ).clone( roadCoord.s );

		lane.addWidthRecordInstance( laneWidth );

		return laneWidth.node = new LaneWidthNode( laneWidth );
	}

	// update s value of lane-width as per the restriction
	static updateLaneWidthNode ( node: LaneWidthNode, point: Vector3, direction = 'sCoordinate' ): void {

		const index = node.lane.getLaneWidthVector().findIndex( i => i.uuid === node.laneWidth.uuid );

		if ( index === -1 ) SnackBar.error( 'Unexpected error. Not able to find this node' );
		if ( index === -1 ) return;

		if ( index === 0 ) SnackBar.warn( 'First node cannot be edited. Please add a new node.' );
		if ( index === 0 ) return;

		// const minS = node.lane.width[ index - 1 ].s + 0.1;

		// // TODO: mke this the max s value as per lane section
		// let maxS = Number.MAX_SAFE_INTEGER;

		// if ( index + 1 < node.lane.width.length ) {

		// 	maxS = node.lane.width[ index + 1 ].s - 0.1;

		// }

		const road = node.lane.laneSection.road;
		const roadCoord = road.getCoordAt( point );
		const adjustedS = roadCoord.s - node.lane.laneSection.s;

		// // our desired s value should lie between the previous node and the next node
		// const adjustedS = Maths.clamp( roadCoord.s, minS, maxS );

		// update s offset as per the new position on road
		node.laneWidth.s = adjustedS;

		const offset = node.laneWidth.getValue( adjustedS ) * 0.5;

		let sCoordinate = null;

		if ( direction === 'sCoordinate' ) {

			sCoordinate = adjustedS;

		} else if ( direction === 'tCoordinate' ) {

			sCoordinate = node.laneWidth.s;

		}

		const start = TvMapQueries.getLaneCenterPosition( node.roadId, node.laneId, roadCoord.s, -offset );
		const end = TvMapQueries.getLaneCenterPosition( node.roadId, node.laneId, roadCoord.s, offset );


		// TODO: can be improved
		node.line.geometry.dispose();
		node.line.geometry = new BufferGeometry().setFromPoints( [ start, end ] );

		node.point.position.copy( end );

		node.laneWidth.s = adjustedS;
	}

	/**
	 * Updates the lane width line position
	 * @param node LaneWidthNode
	 */
	static updateLaneWidthNodeLine ( node: LaneWidthNode ) {

		const laneWidth = node.laneWidth;

		if ( node.laneWidth.s < 0 ) node.laneWidth.s = 0;

		const s = node.lane.laneSection.s + node.laneWidth.s;

		const offset = laneWidth.getValue( node.laneWidth.s ) * 0.5;

		const start = TvMapQueries.getLaneCenterPosition( node.roadId, node.laneId, s, -offset );
		const end = TvMapQueries.getLaneCenterPosition( node.roadId, node.laneId, s, offset );

		// TODO: can be improved
		node.line.geometry.dispose();
		node.line.geometry = new BufferGeometry().setFromPoints( [ start, end ] );

		node.point.position.copy( end );
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

	// static updateRoadMarkNodeByPosition ( node: LaneRoadMarkNode, point: Vector3 ) {

	// 	const index = node.lane.getRoadMarks().findIndex( roadmark => roadmark.uuid === node.roadmark.uuid );

	// 	if ( index === -1 ) SnackBar.error( 'Unexpected error. Not able to find this node' );
	// 	if ( index === -1 ) return node;

	// 	if ( index === 0 ) SnackBar.error( 'First node cannot be edited. Please add a new node.' );
	// 	if ( index === 0 ) return node;

	// 	const minS = node.lane.roadMark[ index - 1 ].s + 0.1;

	// 	// TODO: mke this the max s value as per lane section
	// 	let maxS = Number.MAX_SAFE_INTEGER;

	// 	if ( index + 1 < node.lane.roadMark.length ) {

	// 		maxS = node.lane.roadMark[ index + 1 ].s - 0.1;

	// 	}

	// 	const newPosition = new TvPosTheta();

	// 	const road = TvMapQueries.getRoadByCoords( point.x, point.y, newPosition );

	// 	// we are getting another road s value to ignore
	// 	if ( node.lane.roadId !== road.id ) return node;

	// 	// our desired s value should lie between the previous node and the next node
	// 	const adjustedS = Maths.clamp( newPosition.s, minS, maxS );

	// 	// update s offset as per the new position on road
	// 	node.roadmark.sOffset = adjustedS;

	// 	const offset = node.lane.getWidthValue( adjustedS ) * 0.5;

	// 	const finalPosition = TvMapQueries.getLanePosition( node.lane.roadId, node.lane.id, adjustedS, offset );

	// 	node.point.copyPosition( finalPosition );

	// 	return node;
	// }
}
