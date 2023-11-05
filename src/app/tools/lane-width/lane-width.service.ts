import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from 'app/services/scene.service';
import { LaneWidthNode } from 'app/modules/three-js/objects/lane-width-node';
import { MapService } from 'app/services/map.service';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { BufferGeometry, Vector3 } from 'three';
import { TvUtils } from 'app/modules/tv-map/models/tv-utils';
import { SnackBar } from 'app/services/snack-bar.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthService {

	private static nodes: LaneWidthNode[] = [];

	constructor (
		public base: BaseToolService,
		private mapService: MapService
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

		LaneWidthService.nodes
			.filter( i => i.laneWidth.uuid === node.laneWidth.uuid )
			.forEach( i => i.unselect() );

	}

	selectNode ( node: LaneWidthNode ) {

		LaneWidthService.nodes
			.filter( i => i.laneWidth.uuid === node.laneWidth.uuid )
			.forEach( i => i.select() );

	}

	addNode ( node: LaneWidthNode ) {

		node.lane.addWidthRecordInstance( node.laneWidth );

		SceneService.addToolObject( node );

		LaneWidthService.nodes.push( node );

	}

	removeNode ( node: LaneWidthNode ) {

		node.lane.removeWidthRecordInstance( node.laneWidth );

		LaneWidthService.nodes.filter( i => i.laneWidth.uuid === node.laneWidth.uuid ).forEach( i => {

			SceneService.removeFromTool( i );

		} );

		LaneWidthService.nodes = LaneWidthService.nodes.filter( i => i.laneWidth.uuid !== node.laneWidth.uuid );

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

	public hideWidthNodes ( road: TvRoad ) {

		LaneWidthService.nodes.filter( node => node.road.id === road.id ).forEach( node => {

			SceneService.removeFromTool( node );

		} );

		LaneWidthService.nodes = LaneWidthService.nodes.filter( node => node.road.id !== road.id );

	}

	public showWidthNodes ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				lane.getLaneWidthVector().forEach( laneWidth => {

					const node = new LaneWidthNode( laneWidth );

					SceneService.addToolObject( node );

					LaneWidthService.nodes.push( node );

				} );

			} );

		} );

	}

}
