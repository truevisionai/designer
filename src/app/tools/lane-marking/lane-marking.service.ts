import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Object3DMap } from '../lane-width/object-3d-map';
import { LaneMarkingNode } from 'app/modules/three-js/objects/lane-road-mark-node';
import { LaneDebugService } from '../../services/debug/lane-debug.service';
import { DebugLine } from 'app/services/debug/debug-line';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Vector2 } from 'three';
import { LaneRoadMarkFactory } from 'app/factories/lane-road-mark-factory';

@Injectable( {
	providedIn: 'root'
} )
export class LaneMarkingService {

	private static nodeMap: Object3DMap<string, LaneMarkingNode> = new Object3DMap();

	private static lineMap: Object3DMap<string, DebugLine<LaneMarkingNode>> = new Object3DMap();

	constructor (
		public base: BaseToolService,
		private debug: LaneDebugService,
		private roadMarkBuilder: LaneRoadMarkFactory
	) { }

	rebuildMarkings ( node: LaneMarkingNode ) {

		this.roadMarkBuilder.buildRoad( node.lane.laneSection.road );

	}

	updateNode ( node: LaneMarkingNode ) {

		this.rebuildMarkings( node );

		this.hideRoad( node.lane.laneSection.road );
		this.showRoad( node.lane.laneSection.road );

	}

	addNode ( node: LaneMarkingNode ) {

		node.lane.addRoadMarkInstance( node.roadmark );

		this.rebuildMarkings( node );

		this.hideRoad( node.lane.laneSection.road );
		this.showRoad( node.lane.laneSection.road );

	}

	removeNode ( node: LaneMarkingNode ) {

		node.lane.removeRoadMark( node.roadmark );

		this.rebuildMarkings( node );

		this.hideRoad( node.lane.laneSection.road );
		this.showRoad( node.lane.laneSection.road );

	}

	showRoad ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < lane.roadMark.length; i++ ) {

					const laneMark = lane.roadMark[ i ];

					const node = new LaneMarkingNode( lane, laneMark );

					const sStart = laneMark.s;

					const sEnd = lane.roadMark[ i + 1 ]?.s || laneSection.length;

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

					LaneMarkingService.lineMap.add( laneMark.uuid, line );

					LaneMarkingService.nodeMap.add( laneMark.uuid, node );

				}

			} );

		} );
	}

	hideRoad ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < lane.roadMark.length; i++ ) {

					LaneMarkingService.nodeMap.remove( lane.roadMark[ i ].uuid );

					LaneMarkingService.lineMap.remove( lane.roadMark[ i ].uuid );

				}

			} )

		} );

		LaneMarkingService.lineMap.clear();

		LaneMarkingService.nodeMap.clear();

	}

}
