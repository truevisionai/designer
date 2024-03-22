/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { LaneWidthNode } from 'app/objects/lane-width-node';
import { MapService } from 'app/services/map/map.service';
import { TvLane } from 'app/map/models/tv-lane';
import { BufferGeometry, Vector2, Vector3 } from 'three';
import { TvUtils } from 'app/map/models/tv-utils';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneDebugService } from '../../services/debug/lane-debug.service';
import { DebugLine } from 'app/objects/debug-line';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Object3DMap } from '../../core/models/object3d-map';
import { BaseService } from 'app/services/base.service';
import { LaneWidthService } from './lane-width.service';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { TvLaneSide } from 'app/map/models/tv-common';
import { TvLaneWidth } from 'app/map/models/tv-lane-width';

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthToolService {

	private nodes: Object3DMap<string, LaneWidthNode> = new Object3DMap();

	private lines: Object3DMap<string, DebugLine<LaneWidthNode>> = new Object3DMap();

	constructor (
		public base: BaseToolService,
		private mapService: MapService,
		private debug: LaneDebugService,
		private baseService: BaseService,
		private laneWidthService: LaneWidthService,
		private debugDrawService: DebugDrawService,
		private snackBar: SnackBar
	) {
	}

	createWidthNode ( lane: TvLane, position: Vector3 ) {

		const road = lane.laneSection.road;

		const roadCoord = road.getPosThetaByPosition( position );

		const s = roadCoord.s - lane.laneSection.s;

		let widthValue = lane.getWidthValue( s );

		if ( !widthValue ) {
			widthValue = 3.2;
		}

		const laneWidth = new TvLaneWidth( s, widthValue, 0, 0, 0, lane );

		return new LaneWidthNode( laneWidth );

	}

	updateByPosition ( node: LaneWidthNode, position: Vector3 ) {

		const index = node.lane.getLaneWidthVector().findIndex( i => i.uuid === node.laneWidth.uuid );

		if ( index === -1 ) {
			this.snackBar.error( 'Unexpected error. Not able to find this node' );
			return;
		}

		if ( index === 0 ) {
			this.snackBar.warn( 'First node cannot be edited. Please add a new node.' );
			return;
		}

		const road = node.lane.laneSection.road;

		const roadCoord = road.getPosThetaByPosition( position );

		const adjustedS = roadCoord.s - node.lane.laneSection.s;

		// update s offset as per the new position on road
		node.laneWidth.s = adjustedS;

		const startPosition = road.getLaneStartPosition( node.lane, adjustedS ).toVector3();

		const distance = position.distanceTo( startPosition );

		node.laneWidth.a = distance;

		const laneSectionLength = road.length - node.lane.laneSection.s;

		TvUtils.computeCoefficients( node.lane.width, laneSectionLength );

		this.updateNode( node );

	}

	unselectNode ( node: LaneWidthNode ) {

		this.nodes.get( node.laneWidth.uuid )?.unselect();
		this.lines.get( node.laneWidth.uuid )?.unselect();

	}

	selectNode ( node: LaneWidthNode ) {

		this.nodes.get( node.laneWidth.uuid )?.select();
		this.lines.get( node.laneWidth.uuid )?.select();

	}

	addNode ( node: LaneWidthNode ) {

		this.laneWidthService.addLaneWidth( node.lane.laneSection, node.lane, node.laneWidth );

		this.hideWidthNodes( node.lane.laneSection.road );
		this.showWidthNodes( node.lane.laneSection.road );

	}

	removeNode ( node: LaneWidthNode ) {

		this.laneWidthService.removeLaneWidth( node.lane.laneSection, node.lane, node.laneWidth );

		this.hideWidthNodes( node.lane.laneSection.road );
		this.showWidthNodes( node.lane.laneSection.road );

	}

	updateNode ( node: LaneWidthNode ) {

		const road = node.road;

		const laneSection = road.getLaneSectionAt( node.laneWidth.s )

		this.laneWidthService.updateLaneWidth( laneSection, node.lane, node.laneWidth );

		// resize the node geometry
		const s = node.lane.laneSection.s + node.laneWidth.s;
		const offset = node.laneWidth.getValue( node.laneWidth.s ) * 0.5;
		const start = road.getLaneCenterPosition( node.lane, s, -offset ).toVector3();
		const end = road.getLaneCenterPosition( node.lane, s, offset ).toVector3();

		node.point.position.copy( end );

		node.line.geometry.dispose();

		// node.line.geometry = new BufferGeometry().setFromPoints( [ start, end ] );
		node.line.geometry = new LineGeometry().setPositions( [ start, end ].flatMap( p => [ p.x, p.y, p.z ] ) );

		this.hideWidthNodes( node.lane.laneSection.road );
		this.showWidthNodes( node.lane.laneSection.road );

	}

	removeAllWidthNodes () {

		this.mapService.map.getRoads().forEach( road => {

			this.hideWidthNodes( road );

		} );

	}

	hideWidthNodes ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < lane.width.length; i++ ) {

					this.nodes.remove( lane.width[ i ].uuid );

					this.lines.remove( lane.width[ i ].uuid );

				}

			} )

		} );

		this.lines.clear();

		this.nodes.clear();

	}

	showWidthNodes ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				if ( lane.side == TvLaneSide.CENTER ) return;

				for ( let i = 0; i < lane.width.length; i++ ) {

					const laneWidth = lane.width[ i ];

					const node = new LaneWidthNode( laneWidth );

					const sStart = laneWidth.s;

					// get s of next lane width node
					let sEnd = lane.width[ i + 1 ]?.s || laneSection.length;

					const points = this.debug.getPoints( lane, sStart, sEnd, 0.1 );

					const line = this.debugDrawService.createDebugLine( node, points, 4 );

					this.lines.add( laneWidth.uuid, line );

					this.nodes.add( laneWidth.uuid, node );

				}

			} );

		} );

	}

}
