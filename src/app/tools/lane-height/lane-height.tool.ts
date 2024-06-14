/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from "../tool-types.enum";
import { LaneHeightInspector } from "../../map/lane-height/lane-height.inspector";
import { TvLaneHeight } from "app/map/lane-height/lane-height.model";
import { BaseLaneTool } from "../base-lane.tool";
import { LanePointNode, LaneSpanNode } from "../../objects/lane-node";
import { LaneHeightToolService } from "./lane-height-tool.service";
import { DebugState } from "app/services/debug/debug-state";
import { AppInspector } from "app/core/inspector";
import { PointerEventData } from "app/events/pointer-event-data";
import { CommandHistory } from "app/services/command-history";
import { TvLaneCoord } from "app/map/models/tv-lane-coord";
import { SetValueCommand } from "app/commands/set-value-command";
import { TvLane } from "app/map/models/tv-lane";

export class LaneHeightTool extends BaseLaneTool<TvLaneHeight> {

	public typeName: string = TvLaneHeight.name;

	public name: string = 'LaneHeight';

	public toolType: ToolType = ToolType.LaneHeight;

	private laneSpanNode: LaneSpanNode<TvLaneHeight>;

	constructor ( private tool: LaneHeightToolService ) {

		super();

	}

	init (): void {

		this.debugger = this.tool.toolDebugger;

		this.setHint( 'use LEFT CLICK to select a road' );

	}

	onPointerUp ( e: PointerEventData ) {

		if ( !e.point ) return

		if ( !this.nodeChanged ) return;

		if ( !this.laneSpanNode ) return;

		const newPosition = this.tool.roadService.findRoadCoordAtPosition( e.point.clone() );

		const oldPosition = this.tool.roadService.findRoadCoordAtPosition( this.pointerDownAt.clone() );

		const newSOffset = newPosition.s - this.laneSpanNode.lane.laneSection.s;

		const oldSOffset = oldPosition.s - this.laneSpanNode.lane.laneSection.s;

		const command = new SetValueCommand( this.laneSpanNode, 's', newSOffset, oldSOffset );

		CommandHistory.execute( command );

		this.nodeChanged = false;

	}

	onPointerMoved ( e: PointerEventData ) {

		if ( !this.isPointerDown ) {

			this.highlight( e );

			return;
		}

		if ( !this.laneSpanNode ) return;

		if ( !this.laneSpanNode.isSelected ) return;

		const roadCoord = this.tool.roadService.findRoadCoordAtPosition( e.point );

		const laneSection = this.laneSpanNode.lane.laneSection;

		const sOffset = roadCoord.s - laneSection.s;

		const laneCoord = new TvLaneCoord( roadCoord.road, laneSection, this.laneSpanNode.lane, sOffset, 0 );

		this.debugDrawService.updateLaneWidthLine( this.laneSpanNode, laneCoord );

		this.nodeChanged = true;

	}

	onCreateObject ( e: PointerEventData ): void {

		if ( e.point == null ) return;

		if ( this.selectedLane == null ) return;

		const roadCoord = this.tool.roadService.findRoadCoordAtPosition( e.point );

		const laneSection = this.selectedLane.laneSection;

		const sOffset = roadCoord.s - laneSection.s;

		const height = this.selectedLane.getHeightValue( sOffset ) || new TvLaneHeight( sOffset, 0.1, 0.1 );

		const node = this.tool.toolDebugger.createHeightNode( this.selectedLane, height );

		this.executeAddAndSelect( node, this.selectedNode );

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof LaneSpanNode ) {

			this.addLaneHeight( object.lane, object.target );

			this.onObjectSelected( object );

		} else if ( object instanceof LaneHeightInspector ) {

			this.addLaneHeight( object.lane, object.laneHeight );

		} else {

			super.onObjectAdded( object );

			this.onObjectSelected( object );

		}

	}

	onObjectUpdated ( object: any ) {

		if ( object instanceof LaneHeightInspector ) {

			this.updateLaneHeight( object.lane, object.laneHeight );

		} else if ( object instanceof LaneSpanNode ) {

			this.updateLaneHeight( object.lane, object.target );

			this.onObjectSelected( object );

		} else {

			super.onObjectUpdated( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof LaneHeightInspector ) {

			this.removeLaneHeight( object.lane, object.laneHeight );

			this.onObjectUnselected( object );

		} else if ( object instanceof LaneSpanNode ) {

			this.removeLaneHeight( object.lane, object.target );

			this.onObjectUnselected( object );

		} else {

			super.onObjectRemoved( object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof LaneSpanNode ) {

			if ( this.laneSpanNode ) this.onObjectUnselected( this.laneSpanNode );

			this.laneSpanNode = object;

			object.select();

			this.setInspector( new LaneHeightInspector( object.target, object.lane ) );

		} else {

			if ( this.laneSpanNode ) this.onObjectUnselected( this.laneSpanNode );

			super.onObjectSelected( object );

		}

	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof LaneSpanNode ) {

			object.unselect();

			this.laneSpanNode = null;

			AppInspector.clear();

		} else {

			if ( this.laneSpanNode ) this.onObjectUnselected( this.laneSpanNode );

			super.onObjectUnselected( object );

		}

	}

	protected onShowInspector ( node: LanePointNode<TvLaneHeight> ) {

		this.setInspector( new LaneHeightInspector( node.mainObject, node.lane ) );

	}

	private removeLaneHeight ( lane: TvLane, laneHeight: TvLaneHeight ) {

		this.data.remove( lane, laneHeight );

		this.debugger.updateDebugState( lane, DebugState.SELECTED );

		AppInspector.clear();

	}

	private addLaneHeight ( lane: TvLane, laneHeight: TvLaneHeight ) {

		this.data.add( lane, laneHeight );

		this.debugger.updateDebugState( lane, DebugState.SELECTED );

		this.setInspector( new LaneHeightInspector( laneHeight, lane ) );

	}

	private updateLaneHeight ( lane: TvLane, laneHeight: TvLaneHeight ) {

		this.data.update( lane, laneHeight );

		this.debugger.updateDebugState( lane, DebugState.SELECTED );

		this.setInspector( new LaneHeightInspector( laneHeight, lane ) );

	}

}
