/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { DebugDrawService } from 'app/services/debug/debug-draw.service';
import { SceneService } from 'app/services/scene.service';
import { Line2 } from 'three/examples/jsm/lines/Line2';
// import { JunctionService } from 'app/services/junction/junction.service';
// import { JunctionNode, JunctionNodeService } from 'app/services/junction/junction-node.service';
// import { NodeStrategy } from 'app/core/snapping/select-strategies/node-strategy';


export class JunctionTool extends BaseTool {

	public name: string = 'JunctionTool';

	public toolType = ToolType.Junction;

	private roadStrategy: SelectStrategy<TvRoadCoord>;

	private selectedCoords: TvRoadCoord[] = [];
	// private selectedNodes: JunctionNode[] = [];

	private debugDrawService = new DebugDrawService();

	private debugLine: Line2;

	private junctionService: any;
	// private junctionNodeService = new JunctionNodeService();
	// private nodeStrategy: NodeStrategy<JunctionNode>;

	constructor () {

		super();

		this.roadStrategy = new OnRoadStrategy();

		// this.nodeStrategy = new NodeStrategy<JunctionNode>( JunctionNode.tag );

		this.map.junctions.forEach( junction => {

			const mesh = this.junctionService.meshService.createMeshFromJunction( junction );

			SceneService.addToolObject( mesh );

		} )

	}

	init () {

		this.setHint( 'Click on a road to create a junction' );

		// const positions = [];

		// positions.push( new Vector3( 0, 0, 0 ) );
		// positions.push( new Vector3( 40, 1, 0 ) );
		// positions.push( new Vector3( 25, 40, 0 ) );
		// positions.push( new Vector3( -10, 37, 0 ) );
		// positions.push( new Vector3( 0, 33, 0 ) );

		// const mesh1 = this.junctionService.meshService.createPolygonalMesh( positions );
		// mesh1.position.set( 0, 0, 0 );

		// const mesh3 = this.junctionService.meshService.createLinedShapeMesh( positions );
		// mesh3.position.set( 50, 0, 0 );

		// const mesh4 = this.junctionService.meshService.createSmoothShapeMesh( positions );
		// mesh4.position.set( 0, 50, 0 );

		// SceneService.addToolObject( mesh1 );
		// SceneService.addToolObject( mesh3 );
		// SceneService.addToolObject( mesh4 );

	}

	enable () {

		super.enable();

		// this.junctionNodeService.showAllJunctionNodes();

	}

	disable () {

		super.disable();

		// this.junctionNodeService.hideAllJunctionNodes();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		// const node = this.nodeStrategy.onPointerMoved( e );

		// if ( node ) {

		// 	node.select();

		// 	this.selectedNodes.push( node );

		// 	if ( this.selectedNodes.length === 3 ) {

		// 		this.junctionService.createJunctionFromJunctionNodes( this.selectedNodes );

		// 		this.selectedNodes.splice( 0, this.selectedNodes.length );

		// 	}

		// 	return;
		// };

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		const roadCoord = this.roadStrategy.onPointerDown( e );

		if ( roadCoord ) {

			SceneService.addToolObject( this.debugDrawService.createRoadWidthLine( roadCoord ) );

			this.selectedCoords.push( roadCoord );

		}

		if ( this.selectedCoords.length === 2 ) {

			const junction = this.junctionService.createJunctionFromCoords( this.selectedCoords );

			// SceneService.addToolObject( junction );

			this.selectedCoords.splice( 0, this.selectedCoords.length );

		}

	}

	onPointerMoved ( e: PointerEventData ): void {

		console.log( 'onPointerMoved', e.intersections );

		// if ( this.nodeStrategy.onPointerMoved( e ) ) return;

		const roadCoord = this.roadStrategy.onPointerMoved( e );

		if ( this.debugLine ) this.debugLine.visible = false;

		if ( !roadCoord ) return;

		if ( !this.debugLine ) {

			this.debugLine = this.debugDrawService.createRoadWidthLine( roadCoord );

			SceneService.addToolObject( this.debugLine );

		}

		this.debugLine.visible = true;

		this.debugLine = this.debugDrawService.updateRoadWidthLine( this.debugLine, roadCoord );

	}

}
