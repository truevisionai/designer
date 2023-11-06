import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { LaneWidthNode } from 'app/modules/three-js/objects/lane-width-node';
import { MapService } from 'app/services/map.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { BufferGeometry, Vector2, Vector3 } from 'three';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
import { SnackBar } from 'app/services/snack-bar.service';
import { DebugLine, LaneReferenceLineService } from '../lane-reference-line.service';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Object3DMap } from './object-3d-map';

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthService {

	private static nodeMap: Object3DMap<string, LaneWidthNode> = new Object3DMap();

	private static lineMap: Object3DMap<string, DebugLine<LaneWidthNode>> = new Object3DMap();

	constructor (
		public base: BaseToolService,
		private mapService: MapService,
		private laneReferenceLine: LaneReferenceLineService,
	) { }

	createWidthNode ( lane: TvLane, position: Vector3 ) {

		const road = lane.laneSection.road;

		const roadCoord = road.getCoordAt( position );

		const s = roadCoord.s - lane.laneSection.s;

		const laneWidth = lane.getLaneWidthAt( s ).clone( s );

		return new LaneWidthNode( laneWidth );

	}

	updateByPosition ( node: LaneWidthNode, position: Vector3 ) {

		const index = node.lane.getLaneWidthVector().findIndex( i => i.uuid === node.laneWidth.uuid );

		if ( index === -1 ) {
			SnackBar.error( 'Unexpected error. Not able to find this node' );
			return;
		}

		if ( index === 0 ) {
			SnackBar.warn( 'First node cannot be edited. Please add a new node.' );
			return;
		}

		const road = node.lane.laneSection.road;

		const roadCoord = road.getCoordAt( position );

		const adjustedS = roadCoord.s - node.lane.laneSection.s;

		// update s offset as per the new position on road
		node.laneWidth.s = adjustedS;

		this.updateNode( node );

	}

	unselectNode ( node: LaneWidthNode ) {

		LaneWidthService.nodeMap.get( node.laneWidth.uuid )?.unselect();
		LaneWidthService.lineMap.get( node.laneWidth.uuid )?.unselect();

	}

	selectNode ( node: LaneWidthNode ) {

		LaneWidthService.nodeMap.get( node.laneWidth.uuid )?.select();
		LaneWidthService.lineMap.get( node.laneWidth.uuid )?.select();

	}

	addNode ( node: LaneWidthNode ) {

		node.lane.addWidthRecordInstance( node.laneWidth );

		LaneWidthService.nodeMap.add( node.laneWidth.uuid, node );

	}

	removeNode ( node: LaneWidthNode ) {

		node.lane.removeWidthRecordInstance( node.laneWidth );

		LaneWidthService.nodeMap.remove( node.laneWidth.uuid );
		LaneWidthService.lineMap.remove( node.laneWidth.uuid );

	}

	updateNode ( node: LaneWidthNode ) {

		const road = node.road;

		const laneSection = road.getLaneSectionAt( node.laneWidth.s )

		TvUtils.computeCoefficients( node.lane.getLaneWidthVector(), laneSection.length );

		// resize the node geometry
		const s = node.lane.laneSection.s + node.laneWidth.s;
		const offset = node.laneWidth.getValue( node.laneWidth.s ) * 0.5;
		const start = road.getLaneCenterPosition( node.lane, s, -offset ).toVector3();
		const end = road.getLaneCenterPosition( node.lane, s, offset ).toVector3();

		node.point.position.copy( end );

		node.line.geometry.dispose();

		node.line.geometry = new BufferGeometry().setFromPoints( [ start, end ] );

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

					LaneWidthService.nodeMap.remove( lane.width[ i ].uuid );

					LaneWidthService.lineMap.remove( lane.width[ i ].uuid );

				}

			} )

		} );

		LaneWidthService.lineMap.clear();

		LaneWidthService.nodeMap.clear();

	}

	showWidthNodes ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				for ( let i = 0; i < lane.width.length; i++ ) {

					const laneWidth = lane.width[ i ];

					const node = new LaneWidthNode( laneWidth );

					const sStart = laneWidth.s;

					// get s of next lane width node
					let sEnd = lane.width[ i + 1 ]?.s || laneSection.length;

					const points = this.laneReferenceLine.getPoints( lane, sStart, sEnd );

					const geometry = new LineGeometry()
						.setPositions( points.flatMap( p => [ p.x, p.y, p.z ] ) );

					const material = new LineMaterial( {
						color: COLOR.CYAN,
						linewidth: 2,
						resolution: new Vector2( window.innerWidth, window.innerHeight ),
					} );

					const line = new DebugLine( node, geometry, material );

					line.renderOrder = 999;

					LaneWidthService.lineMap.add( laneWidth.uuid, line );

					LaneWidthService.nodeMap.add( laneWidth.uuid, node );

				}

			} );

		} );

	}

}
