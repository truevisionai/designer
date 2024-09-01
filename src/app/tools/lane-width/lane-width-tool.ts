/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from '../../map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { LaneWidthToolService } from './lane-width-tool.service';
import { LaneWidthPointSelectionStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { DebugLine } from "../../objects/debug-line";
import { LaneWidthPoint } from "../../objects/simple-control-point";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadSelectionStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { RoadController } from 'app/core/object-handlers/road-handler';
import { ToolWithHandler } from '../base-tool-v2';
import { SelectLaneOverlayStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { EmptyController } from 'app/core/object-handlers/empty-controller';
import { EmptyVisualizer } from 'app/core/overlay-handlers/empty-visualizer';
import { LaneWidthRoadVisualizer } from 'app/core/overlay-handlers/road-visualizer';
import { SelectLineStrategy } from 'app/core/strategies/select-strategies/select-line-strategy';
import { LaneWidthPointController, LaneWidthPointVisualizer } from './lane-width-tool.handlers';

export class LaneWidthTool extends ToolWithHandler {

	public name: string = 'LaneWidth';

	public toolType = ToolType.LaneWidth;

	constructor ( private tool: LaneWidthToolService ) {

		super();

	}

	init () {

		this.tool.base.reset();

		this.addStrategies();

		this.addHandlers();

		// const selectLaneStrategy = new SelectLaneStrategy();

		// selectLaneStrategy.debugger = this.tool.toolDebugger;

		// this.selectionService.registerStrategy( TvLane.name, selectLaneStrategy );

		// this.setDataService( this.tool.roadService );

		// this.setDebugService( this.tool.toolDebugger );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	addStrategies (): void {

		this.selectionService.registerStrategy( LaneWidthPoint.name, new LaneWidthPointSelectionStrategy() );

		this.selectionService.registerStrategy( DebugLine.name, new SelectLineStrategy() );

		this.selectionService.registerStrategy( TvLane.name, new SelectLaneOverlayStrategy() );

		this.selectionService.registerStrategy( TvRoad.name, new RoadSelectionStrategy() );

	}

	addHandlers (): void {

		this.addController( LaneWidthPoint.name, this.tool.base.injector.get( LaneWidthPointController ) );
		this.addVisualizer( LaneWidthPoint.name, this.tool.base.injector.get( LaneWidthPointVisualizer ) );

		this.addController( TvLane.name, this.tool.base.injector.get( EmptyController ) );
		this.addVisualizer( TvLane.name, this.tool.base.injector.get( EmptyVisualizer ) );

		this.addController( TvRoad.name, this.tool.base.injector.get( RoadController ) );
		this.addVisualizer( TvRoad.name, this.tool.base.injector.get( LaneWidthRoadVisualizer ) );

	}

	disable () {

		super.disable();

		this.tool.base.reset();

		// if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		// if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );
	}

	// showObjectInspector ( object: object ): void {

	// 	if ( object instanceof LaneWidthNode ) {

	// 		this.setInspector( new LaneWidthNodeInspector( object ) );

	// 	} else if ( object instanceof LaneWidthPoint ) {

	// 		this.setInspector( new LaneWidthPointInspector( object ) );

	// 	}

	// }

	// onPointerDownSelect ( e: PointerEventData ): void {

	// 	this.handleSelection( e );

	// }

	// onPointerDownCreate ( e: PointerEventData ): void {

	// 	if ( !this.selectedLane ) return;

	// 	const node = this.createWidthNode( this.selectedLane.laneSection.road, this.selectedLane, e.point );

	// 	const addCommand = new AddObjectCommand( node );

	// 	const selectCommand = new SelectObjectCommand( node, this.selectedNode );

	// 	CommandHistory.executeMany( addCommand, selectCommand );

	// }

	// onPointerUp ( e: PointerEventData ) {

	// 	this.tool.base.enableControls();

	// 	if ( !this.nodeChanged ) return;

	// 	if ( !this.selectedNode ) return;

	// 	if ( !this.selectedNode.isSelected ) return;

	// 	if ( this.oldValue === null ) return;

	// 	// these could also be user to get old and new s
	// 	// const newPosition = this.selectedNode.position.clone();
	// 	// const oldPosition = this.pointerDownAt.clone();

	// 	const newValue = this.selectedNode.s;

	// 	const oldValue = this.oldValue;

	// 	Commands.SetValue( this.selectedNode.laneWidth, 's', newValue, oldValue );

	// 	this.nodeChanged = false;

	// 	this.oldValue = null;
	// }

	// onPointerMoved ( e: PointerEventData ) {

	// 	this.highlight( e );

	// 	if ( !this.isPointerDown ) return;

	// 	if ( !this.selectedNode ) return;

	// 	if ( !this.selectedNode.isSelected ) return;

	// 	this.tool.updateByPosition( this.selectedNode, e.point );

	// 	if ( !this.nodeChanged ) {
	// 		this.oldValue = this.selectedNode.laneWidth.s;
	// 	}

	// 	this.nodeChanged = true;

	// 	this.tool.base.disableControls();

	// }

	// onObjectAdded ( object: any ): void {

	// 	if ( object instanceof LaneWidthNode ) {

	// 		this.addWidthNode( object );

	// 		this.onNodeSelected( object );

	// 	}

	// }

	// onObjectUpdated ( object: any ): void {

	// 	if ( object instanceof LaneWidthNode ) {

	// 		this.updateWidthNode( object );

	// 	} else if ( object instanceof LaneWidthNodeInspector ) {

	// 		this.updateWidthNode( object.node );

	// 	}

	// }

	// onObjectRemoved ( object: any ): void {

	// 	if ( object instanceof LaneWidthNode ) {

	// 		this.removeWidthNode( object );

	// 		this.onNodeUnselected( object );

	// 	}

	// }

	// onObjectSelected ( object: any ): void {

	// 	if ( object instanceof TvLane ) {

	// 		this.onLaneSelected( object );

	// 	} else if ( object instanceof LaneWidthNode ) {

	// 		this.onNodeSelected( object );
	// 	}

	// }

	// onObjectUnselected ( object: any ): void {

	// 	if ( object instanceof TvLane ) {

	// 		this.onLaneUnselected( object );

	// 	} else if ( object instanceof LaneWidthNode ) {

	// 		this.onNodeUnselected( object );

	// 	}

	// }

	// onLaneSelected ( lane: TvLane ): void {

	// 	if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

	// 	if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

	// 	this.selectedLane = lane;

	// 	this.debugService?.updateDebugState( lane.laneSection.road, DebugState.SELECTED );

	// 	this.clearInspector();

	// 	this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );

	// }

	// onLaneUnselected ( lane: TvLane ): void {

	// 	if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

	// 	this.selectedLane = null;

	// 	this.debugService?.updateDebugState( lane.laneSection.road, DebugState.DEFAULT );

	// 	this.setHint( 'use LEFT CLICK to select a road/lane' );

	// }

	// onNodeSelected ( node: LaneWidthNode ): void {

	// 	if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

	// 	node?.select();

	// 	this.selectedNode = node;

	// 	this.setInspector( new LaneWidthNodeInspector( node ) );

	// 	this.debugService?.updateDebugState( node.lane.laneSection.road, DebugState.SELECTED );

	// 	this.setHint( 'Drag node to modify position. Change properties from inspector' );

	// }

	// onNodeUnselected ( node: LaneWidthNode ): void {

	// 	node?.unselect();

	// 	this.selectedNode = null;

	// 	this.clearInspector();

	// 	this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );

	// }

	// onDeleteKeyDown () {

	// 	if ( !this.selectedNode ) return;

	// 	this.executeRemoveObject( this.selectedNode );

	// }

	// createWidthNode ( road: TvRoad, lane: TvLane, position: Vector3 ) {

	// 	const roadCoord = road.getPosThetaByPosition( position );

	// 	const sOffset = roadCoord.s - lane.laneSection.s;

	// 	const widthValue = lane.getWidthValue( sOffset ) || 3.2;

	// 	const laneWidth = new TvLaneWidth( sOffset, widthValue, 0, 0, 0, lane );

	// 	return this.tool.toolDebugger.createNode( road, lane.laneSection, lane, laneWidth );

	// }

	// addWidthNode ( node: LaneWidthNode ) {

	// 	this.tool.laneWidthService.addLaneWidth( node.lane.laneSection, node.lane, node.laneWidth );

	// 	this.debugService?.updateDebugState( node.lane.laneSection.road, DebugState.SELECTED );

	// 	this.setInspector( new LaneWidthNodeInspector( node ) );

	// }

	// updateWidthNode ( node: LaneWidthNode ) {

	// 	this.tool.laneWidthService.updateLaneWidth( node.lane.laneSection, node.lane, node.laneWidth );

	// 	this.debugService?.updateDebugState( node.lane.laneSection.road, DebugState.SELECTED );

	// 	this.setInspector( new LaneWidthNodeInspector( node ) );

	// }

	// removeWidthNode ( node: LaneWidthNode ) {

	// 	this.tool.laneWidthService.removeLaneWidth( node.lane.laneSection, node.lane, node.laneWidth );

	// 	this.debugService?.updateDebugState( node.lane.laneSection.road, DebugState.DEFAULT );

	// 	this.clearInspector();

	// }

}
