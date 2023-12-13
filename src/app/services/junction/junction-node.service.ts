import { Injectable } from '@angular/core';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { Color, Object3D, Vector2 } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { SceneService } from '../scene.service';
import { Highlightable, ISelectable } from 'app/modules/three-js/objects/i-selectable';
import { MapService } from '../map.service';

export class JunctionNode extends Line2 implements ISelectable, Highlightable {

	static tag = 'JunctionNode'
	tag = 'JunctionNode'
	isSelected: boolean;
	defaulColor = COLOR.CYAN;

	constructor ( public roadCoord: TvRoadCoord, geometry?: LineGeometry, material?: LineMaterial ) {
		super( geometry, material );
	}

	select () {
		this.isSelected = true;
		this.material.color = new Color( COLOR.RED );
		this.renderOrder = 5;
	}

	unselect () {
		this.isSelected = false;
		this.material.color = new Color( this.defaulColor );
		this.renderOrder = 3;
	}

	onMouseOver () {
		this.material.color = new Color( COLOR.YELLOW );
		this.material.needsUpdate = true;
	}

	onMouseOut () {
		this.material.color = new Color( this.defaulColor );
		this.material.needsUpdate = true;
	}
}

@Injectable( {
	providedIn: 'root'
} )
export class JunctionNodeService {

	private static nodes: Object3D[] = [];

	constructor ( private mapService: MapService ) { }

	showAllJunctionNodes () {

		this.mapService.map.getRoads().forEach( road => this.showJunctionNode( road ) );

	}

	hideAllJunctionNodes () {

		JunctionNodeService.nodes.forEach( node => SceneService.removeFromTool( node ) );

		JunctionNodeService.nodes = [];

	}

	showJunctionNode ( road: TvRoad ): void {

		if ( road.isJunction ) return;

		if ( !road.predecessor || road.predecessor.elementType == 'junction' ) {

			const startCoord = road.getStartCoord().toRoadCoord( road );

			const startLine = this.createJunctionNode( startCoord );

			JunctionNodeService.nodes.push( startLine );

			SceneService.addToolObject( startLine );

		}

		if ( !road.successor || road.successor.elementType == 'junction' ) {

			const endCoord = road.getEndCoord().toRoadCoord( road );

			const endLine = this.createJunctionNode( endCoord );

			JunctionNodeService.nodes.push( endLine );

			SceneService.addToolObject( endLine );

		}

	}

	private createJunctionNode ( roadCoord: TvRoadCoord ): JunctionNode {

		const result = roadCoord.road.getRoadWidthAt( roadCoord.s );

		const start = roadCoord.road.getPositionAt( roadCoord.s, result.leftSideWidth );

		const end = roadCoord.road.getPositionAt( roadCoord.s, -result.rightSideWidth );

		const lineGeometry = new LineGeometry();

		lineGeometry.setPositions( [
			start.x, start.y, start.z + 0.1,
			end.x, end.y, end.z + 0.1
		] );

		const lineMaterial = new LineMaterial( {
			color: COLOR.CYAN,
			linewidth: RoadNode.defaultWidth,
			resolution: new Vector2( window.innerWidth, window.innerHeight ), // Add this line
			depthTest: false,
			depthWrite: false,
		} );

		const junctionNode = new JunctionNode( roadCoord, lineGeometry, lineMaterial );

		junctionNode.name = 'DebugDrawService.createRoadWidthLine';

		junctionNode[ 'tag' ] = JunctionNode.tag;

		junctionNode.renderOrder = 3;

		return junctionNode;
	}

	// private updateRoadWidthLine ( line: Line2, roadCoord: TvRoadCoord ): Line2 {

	// 	const result = roadCoord.road.getRoadWidthAt( roadCoord.s );

	// 	const start = roadCoord.road.getPositionAt( roadCoord.s, result.leftSideWidth );

	// 	const end = roadCoord.road.getPositionAt( roadCoord.s, -result.rightSideWidth );

	// 	const lineGeometry = new LineGeometry();

	// 	lineGeometry.setPositions( [
	// 		start.x, start.y, start.z,
	// 		end.x, end.y, end.z
	// 	] );

	// 	line.geometry.dispose();

	// 	line.geometry = lineGeometry;

	// 	return line;
	// }

}
