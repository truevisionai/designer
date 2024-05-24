/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { TvRoad } from 'app/map/models/tv-road.model';
import { Object3DMap } from '../../core/models/object3d-map';
import { LaneMarkingNode } from 'app/objects/lane-road-mark-node';
import { LaneDebugService } from '../../services/debug/lane-debug.service';
import { DebugLine } from 'app/objects/debug-line';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Vector2 } from 'three';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneRoadMark } from 'app/map/models/tv-lane-road-mark';
import { LaneService } from 'app/services/lane/lane.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneMarkingToolService {

	private static nodeMap: Object3DMap<string, LaneMarkingNode> = new Object3DMap();

	private static lineMap: Object3DMap<string, DebugLine<LaneMarkingNode>> = new Object3DMap();

	constructor (
		public base: BaseToolService,
		private debug: LaneDebugService,
		private laneService: LaneService,
	) { }

	rebuild ( lane: TvLane ) {

		this.laneService.updateLane( lane );

		this.hideRoad( lane.laneSection.road );
		this.showRoad( lane.laneSection.road );

	}

	updateNode ( node: LaneMarkingNode ) {

		this.rebuild( node.lane );

	}

	addRoadmark ( lane: TvLane, roadMark: TvLaneRoadMark ) {

		lane.addRoadMarkInstance( roadMark );

		this.rebuild( lane );

	}

	addNode ( node: LaneMarkingNode ) {

		this.addRoadmark( node.lane, node.roadmark );

	}

	removeRoadmark ( lane: TvLane, roadmark: TvLaneRoadMark ) {

		lane.removeRoadMark( roadmark );

		this.rebuild( lane );

	}

	removeNode ( node: LaneMarkingNode ) {

		this.removeRoadmark( node.lane, node.roadmark );

	}

	showRoad ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < lane.roadMarks.length; i++ ) {

					const laneMark = lane.roadMarks[ i ];

					const node = new LaneMarkingNode( lane, laneMark );

					const sStart = laneMark.s;

					const sEnd = lane.roadMarks[ i + 1 ]?.s || laneSection.length;

					const points = this.debug.getPoints( lane, sStart, sEnd, 0.1 );

					const geometry = new LineGeometry()
						.setPositions( points.flatMap( p => [ p.x, p.y, p.z + 0.2 ] ) );

					const material = new LineMaterial( {
						color: COLOR.CYAN,
						linewidth: 2,
						resolution: new Vector2( window.innerWidth, window.innerHeight ),
					} );

					const line = new DebugLine( node, geometry, material );

					line.renderOrder = 999;

					LaneMarkingToolService.lineMap.add( laneMark.uuid, line );

					LaneMarkingToolService.nodeMap.add( laneMark.uuid, node );

				}

			} );

		} );
	}

	hideRoad ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < lane.roadMarks.length; i++ ) {

					LaneMarkingToolService.nodeMap.remove( lane.roadMarks[ i ].uuid );

					LaneMarkingToolService.lineMap.remove( lane.roadMarks[ i ].uuid );

				}

			} )

		} );

		LaneMarkingToolService.lineMap.clear();

		LaneMarkingToolService.nodeMap.clear();

	}

}
