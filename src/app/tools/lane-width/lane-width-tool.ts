/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/services/command-history';
import { PointerEventData } from '../../events/pointer-event-data';
import { LaneWidthNode } from '../../objects/lane-width-node';
import { TvLane } from '../../map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { LaneWidthToolService } from './lane-width-tool.service';
import { SelectLaneStrategy } from 'app/core/strategies/select-strategies/on-lane-strategy';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { SelectLineStrategy } from 'app/core/strategies/select-strategies/select-line-strategy';
import { SetValueCommand } from 'app/commands/set-value-command';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { DebugState } from "../../services/debug/debug-state";
import { DebugLine } from "../../objects/debug-line";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { LaneWidthNodeInspector } from "./lane-width-node-inspector";
import { Vector3 } from "three";
import { TvLaneWidth } from "../../map/models/tv-lane-width";
import { TvRoad } from "../../map/models/tv-road.model";

export class LaneWidthTool extends BaseTool<any> {

	public name: string = 'LaneWidth';

	public toolType = ToolType.LaneWidth;

	private nodeChanged: boolean = false;

	private selectedLane: TvLane;

	private selectedNode: LaneWidthNode;

	private oldValue: number;

	constructor ( private tool: LaneWidthToolService ) {

		super();

	}

	init () {

		this.tool.base.reset();

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy( {
			higlightOnHover: true,
			higlightOnSelect: false,
			tag: LaneWidthNode.pointTag,
			returnParent: true,
		} ) );

		this.selectionService.registerStrategy( DebugLine.name, new SelectLineStrategy() );

		const selectLaneStrategy = new SelectLaneStrategy();

		selectLaneStrategy.debugger = this.tool.toolDebugger;

		this.selectionService.registerStrategy( TvLane.name, selectLaneStrategy );

		this.setDataService( this.tool.roadService );

		this.setDebugService( this.tool.toolDebugger );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.tool.base.reset();

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );
	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.handleSelection( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( ! this.selectedLane ) return;

		const node = this.createWidthNode( this.selectedLane.laneSection.road, this.selectedLane, e.point );

		const addCommand = new AddObjectCommand( node );

		const selectCommand = new SelectObjectCommand( node, this.selectedNode );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onPointerUp ( e: PointerEventData ) {

		this.tool.base.enableControls();

		if ( ! this.nodeChanged ) return;

		if ( ! this.selectedNode ) return;

		if ( ! this.selectedNode.isSelected ) return;

		if ( ! this.oldValue ) return;

		// these could also be user to get old and new s
		// const newPosition = this.selectedNode.position.clone();
		// const oldPosition = this.pointerDownAt.clone();

		const newValue = this.selectedNode.s;

		const oldValue = this.oldValue;

		const setValueCommand = new SetValueCommand( this.selectedNode, 's', newValue, oldValue );

		CommandHistory.execute( setValueCommand );

		this.nodeChanged = false;

		this.oldValue = null;
	}

	onPointerMoved ( e: PointerEventData ) {

		this.highlight( e );

		if ( ! this.isPointerDown ) return;

		if ( ! this.selectedNode ) return;

		if ( ! this.selectedNode.isSelected ) return;

		this.tool.updateByPosition( this.selectedNode, e.point );

		if ( ! this.nodeChanged ) {
			this.oldValue = this.selectedNode.laneWidth.s;
		}

		this.nodeChanged = true;

		this.tool.base.disableControls();

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof LaneWidthNode ) {

			this.addWidthNode( object );

			this.onNodeSelected( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof LaneWidthNode ) {

			this.updateWidthNode( object );

		} else if ( object instanceof LaneWidthNodeInspector ) {

			this.updateWidthNode( object.node );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof LaneWidthNode ) {

			this.removeWidthNode( object );

			this.onNodeUnselected( object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneSelected( object );

		} else if ( object instanceof LaneWidthNode ) {

			this.onNodeSelected( object );
		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof TvLane ) {

			this.onLaneUnselected( object );

		} else if ( object instanceof LaneWidthNode ) {

			this.onNodeUnselected( object );

		}

	}

	onLaneSelected ( lane: TvLane ): void {

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		this.selectedLane = lane;

		this.debugService?.updateDebugState( lane.laneSection.road, DebugState.SELECTED );

		this.clearInspector();

		this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );

	}

	onLaneUnselected ( lane: TvLane ): void {

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		this.selectedLane = null;

		this.debugService?.updateDebugState( lane.laneSection.road, DebugState.DEFAULT );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	onNodeSelected ( node: LaneWidthNode ): void {

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		node?.select();

		this.selectedNode = node;

		this.setInspector( new LaneWidthNodeInspector( node ) );

		this.debugService?.updateDebugState( node.lane.laneSection.road, DebugState.SELECTED );

		this.setHint( 'Drag node to modify position. Change properties from inspector' );

	}

	onNodeUnselected ( node: LaneWidthNode ): void {

		node?.unselect();

		this.selectedNode = null;

		this.clearInspector();

		this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );

	}

	onDeleteKeyDown () {

		if ( ! this.selectedNode ) return;

		this.executeRemoveObject( this.selectedNode );

	}

	createWidthNode ( road: TvRoad, lane: TvLane, position: Vector3 ) {

		const roadCoord = road.getPosThetaByPosition( position );

		const sOffset = roadCoord.s - lane.laneSection.s;

		const widthValue = lane.getWidthValue( sOffset ) || 3.2;

		const laneWidth = new TvLaneWidth( sOffset, widthValue, 0, 0, 0, lane );

		return this.tool.toolDebugger.createNode( road, lane.laneSection, lane, laneWidth );

	}

	addWidthNode ( node: LaneWidthNode ) {

		this.tool.laneWidthService.addLaneWidth( node.lane.laneSection, node.lane, node.laneWidth );

		this.debugService?.updateDebugState( node.lane.laneSection.road, DebugState.SELECTED );

		this.setInspector( new LaneWidthNodeInspector( node ) );

	}

	updateWidthNode ( node: LaneWidthNode ) {

		this.tool.laneWidthService.updateLaneWidth( node.lane.laneSection, node.lane, node.laneWidth );

		this.debugService?.updateDebugState( node.lane.laneSection.road, DebugState.SELECTED );

		this.setInspector( new LaneWidthNodeInspector( node ) );

	}

	removeWidthNode ( node: LaneWidthNode ) {

		this.tool.laneWidthService.removeLaneWidth( node.lane.laneSection, node.lane, node.laneWidth );

		this.debugService?.updateDebugState( node.lane.laneSection.road, DebugState.DEFAULT );

		this.clearInspector();

	}

}
