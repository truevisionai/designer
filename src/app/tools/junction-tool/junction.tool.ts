/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { JunctionService } from 'app/services/junction/junction.service';
import { JunctionNode } from 'app/services/junction/junction-node.service';
import { SelectLineStrategy } from 'app/core/snapping/select-strategies/select-line-strategy';
import { SceneService } from 'app/services/scene.service';
import { CommandHistory } from 'app/services/command-history';
import { TvJunction } from 'app/modules/tv-map/models/junctions/tv-junction';
import { AddObjectCommand } from "../../commands/add-object-command";
import { TvLaneSide } from 'app/modules/tv-map/models/tv-common';
import { JunctionFactory } from 'app/factories/junction.factory';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';


export class JunctionTool extends BaseTool {

	public name: string = 'JunctionTool';

	public toolType = ToolType.Junction;

	private selectedCoords: TvRoadCoord[] = [];
	private selectedNodes: JunctionNode[] = [];

	private debugLine: Line2;
	private debug: boolean = true;

	constructor ( private tool: JunctionService ) {

		super();

	}

	init () {

		this.setHint( 'Click on a road to create a junction' );

		this.tool.base.addSelectionStrategy( new SelectLineStrategy( {
			higlightOnHover: true,
			higlightOnSelect: false,
			tag: null,
			returnParent: false,
			returnTarget: false,
		} ) );

	}

	enable () {

		super.enable();

		this.tool.showJunctionNodes();

	}

	disable () {

		super.disable();

		this.tool.removeJunctionNodes();

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.handleSelection( e, ( object ) => {

			if ( object instanceof JunctionNode ) {

				this.selectObject( object, null );

			}

		}, () => {

			this.unselectObject( this.selectedNodes );

		} )

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

		// const roadCoord = this.roadStrategy.onPointerDown( e );

		// if ( roadCoord ) {

		// 	SceneService.addToolObject( this.tool.debug.createRoadWidthLine( roadCoord ) );

		// 	this.selectedCoords.push( roadCoord );

		// }

		// if ( this.selectedCoords.length === 2 ) {

		// 	const junction = this.tool.createJunctionFromCoords( this.selectedCoords );

		// 	// SceneService.addToolObject( junction );

		// 	this.selectedCoords.splice( 0, this.selectedCoords.length );

		// }

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.tool.base.highlight( e );

		// if (this.debug) console.log( 'onPointerMoved', e.intersections );

		// // if ( this.nodeStrategy.onPointerMoved( e ) ) return;

		// const roadCoord = this.roadStrategy.onPointerMoved( e );

		// if ( this.debugLine ) this.debugLine.visible = false;

		// if ( !roadCoord ) return;

		// if ( !this.debugLine ) {

		// 	this.debugLine = this.tool.debug.createRoadWidthLine( roadCoord );

		// 	SceneService.addToolObject( this.debugLine );

		// }

		// this.debugLine.visible = true;

		// this.debugLine = this.tool.debug.updateRoadWidthLine( this.debugLine, roadCoord );

	}

	onKeyDown ( e: KeyboardEvent ): void {

		if ( this.selectedNodes.length < 2 ) return;

		if ( this.debug ) console.log( 'onKeyDown', e );

		if ( e.code !== 'Space' ) return;

		if ( this.debug ) console.log( 'Space', this.selectedNodes );

		const coord1 = this.selectedNodes[ 0 ].roadCoord;
		const coord2 = this.selectedNodes[ 1 ].roadCoord;

		const junction = JunctionFactory.createJunction();;

		this.selectedNodes[ 0 ].roadCoord.laneSection.lanes.forEach( lane => {

			if ( lane.side == TvLaneSide.CENTER ) return;
			if ( lane.id < 0 ) return; // only right side lanes

			const l1 = lane;
			const l2 = this.selectedNodes[ 1 ].roadCoord.laneSection.getLaneById( lane.id );

			if ( !l2 ) return;

			let connectingRoad: TvRoad;

			if ( coord1.contact == coord2.contact ) {

				connectingRoad = this.tool.connectionService.connectLaneCoord( coord2.toLaneCoord( l2 ), coord1.toLaneCoord( l1 ) );

			} else {

				connectingRoad = this.tool.connectionService.connectLaneCoord( coord1.toLaneCoord( l1 ), coord2.toLaneCoord( l2 ) );

			}

			const connectingRoadLane = connectingRoad.laneSections[ 0 ].getLaneArray().find( i => i.id != 0 );

			const connection = this.tool.connectionService.createConnectionV2( junction, coord1.road, connectingRoad, coord1.contact );

			const laneLink = this.tool.laneLinkService.createLaneLink( l1, connectingRoadLane );

			junction.addConnection( connection );

			connection.addLaneLink( laneLink );

		} );

		// const junction = this.tool.createJunctionFromJunctionNodes( this.selectedNodes );

		const addCommand = new AddObjectCommand( junction );

		CommandHistory.execute( addCommand );
	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvJunction ) {

			this.map.addJunctionInstance( object );

			object.connections.forEach( connection => {

				this.map.addRoad( connection.connectingRoad );

				MapEvents.roadCreated.emit( new RoadCreatedEvent( connection.connectingRoad ) );

			} );

			SceneService.addToMain( object.mesh );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvJunction ) {

			object.connections.forEach( connection => {

				MapEvents.roadRemoved.emit( new RoadRemovedEvent( connection.connectingRoad ) );

				this.map.removeRoad( connection.connectingRoad );

			} );

			this.map.removeJunction( object );

			SceneService.removeFromMain( object.mesh );
		}

	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectSelected', object );

		if ( object instanceof JunctionNode ) {

			this.onNodeSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUnselected', object );

		if ( object instanceof JunctionNode ) {

			this.onNodeUnselected( object );

		}

	}

	onNodeSelected ( node: JunctionNode ) {

		console.log( 'onNodeSelected', node.roadCoord.contact );

		node?.select();

		this.selectedNodes.push( node );
	}

	onNodeUnselected ( node: JunctionNode ) {

		node?.unselect();

		this.selectedNodes.splice( this.selectedNodes.indexOf( node ), 1 );
	}

}
