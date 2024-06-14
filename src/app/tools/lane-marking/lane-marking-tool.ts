/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../events/pointer-event-data';
import { LaneMarkingNode } from '../../objects/lane-road-mark-node';
import { TvLane } from '../../map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { LaneMarkingToolService } from './lane-marking-tool.service';
import { CommandHistory } from 'app/services/command-history';
import { TvRoad } from 'app/map/models/tv-road.model';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { SelectLineStrategy } from 'app/core/strategies/select-strategies/select-line-strategy';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { SelectLaneStrategy } from 'app/core/strategies/select-strategies/on-lane-strategy';
import { EndLaneMovingStrategy } from 'app/core/strategies/move-strategies/end-lane.moving.strategy';
import { SetValueCommand } from 'app/commands/set-value-command';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { TvLaneRoadMark } from 'app/map/models/tv-lane-road-mark';
import { Environment } from 'app/core/utils/environment';
import { LaneMarkingInspector } from './lane-marking.inspector';
import { DebugState } from 'app/services/debug/debug-state';
import { Maths } from 'app/utils/maths';
import { NewLanePosition } from 'app/scenario/models/positions/tv-lane-position';

export class LaneMarkingTool extends BaseTool<any> {

	public name: string = 'LaneMarking';

	public toolType = ToolType.LaneMarking;

	public nodeMoved: boolean;

	public selectedRoad: TvRoad;

	public selectedLane: TvLane;

	public selectedNode: LaneMarkingNode;

	constructor ( private tool: LaneMarkingToolService ) {

		super();

	}

	init () {

		this.setHint( 'Use LEFT CLICK to select road or lane' );

		this.tool.base.reset();

		this.tool.base.addSelectionStrategy( new ControlPointStrategy( {
			higlightOnHover: true,
			higlightOnSelect: false,
			returnParent: false,
		} ) );

		this.tool.base.addSelectionStrategy( new SelectLineStrategy( {
			higlightOnHover: true,
			higlightOnSelect: true,
			tag: null,
			returnParent: false,
			returnTarget: true,
		} ) );

		const laneStrategy = new SelectLaneStrategy( true );

		laneStrategy.debugger = this.tool.toolDebugger;

		this.tool.base.addSelectionStrategy( laneStrategy );

		this.tool.base.addMovingStrategy( new EndLaneMovingStrategy() );

		this.setDebugService( this.tool.toolDebugger );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

	}

	onPointerDownSelect ( e: PointerEventData ) {

		this.tool.base.handleSelection( e, selected => {

			if ( selected instanceof LaneMarkingNode ) {

				if ( this.selectedNode === selected ) return;

				this.selectObject( selected, this.selectedNode );

			} else if ( selected instanceof TvLane ) {

				if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

				if ( this.selectedLane === selected ) return;

				this.selectObject( selected, this.selectedLane );

			}

		}, () => {

			if ( this.selectedNode ) {

				this.unselectObject( this.selectedNode );

			} else if ( this.selectedLane ) {

				this.unselectObject( this.selectedLane );

			}

		} );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.selectedLane ) return;

		const roadCoord = this.selectedRoad.getPosThetaByPosition( e.point );

		const s = Maths.clamp( roadCoord.s - this.selectedLane.laneSection.s, 0, this.selectedLane.laneSection.length );

		let marking = this.selectedLane.getRoadMarkAt( s )?.clone( s );

		if ( !marking ) {
			marking = TvLaneRoadMark.createSolid( this.selectedLane, s );
		}

		const road = this.selectedLane.laneSection.road;

		const laneSection = this.selectedLane.laneSection;

		const node = this.tool.toolDebugger.createNode( road, laneSection, this.selectedLane, marking );

		const addCommand = new AddObjectCommand( node );

		const selectCommand = new SelectObjectCommand( node, this.selectedNode );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onPointerUp ( e: PointerEventData ) {

		if ( !this.selectedNode ) return

		if ( !this.nodeMoved ) return;

		if ( !this.pointerDownAt ) return;

		const laneSection = this.selectedNode.lane.laneSection;

		const oldPosition = this.pointerDownAt.clone();
		const oldRoadCoord = this.tool.roadService.findRoadCoordAtPosition( oldPosition );
		const oldOffset = Maths.clamp( oldRoadCoord.s - laneSection.s, 0, laneSection.length );

		const newPosition = this.selectedNode.position.clone();
		const newRoadCoord = this.tool.roadService.findRoadCoordAtPosition( newPosition );
		const newOffset = Maths.clamp( newRoadCoord.s - laneSection.s, 0, laneSection.length );

		CommandHistory.execute( new SetValueCommand( this.selectedNode, 's', newOffset, oldOffset ) );

		this.nodeMoved = false;

	}

	onPointerMoved ( e: PointerEventData ) {

		if ( !this.isPointerDown ) {

			this.tool.base.highlight( e );

			return;
		}

		if ( !this.isPointerDown ) return;

		if ( !this.selectedNode ) return

		this.tool.base.handleTargetMovement( e, this.selectedNode.lane, position => {

			if ( position instanceof NewLanePosition ) {

				const road = position.road;

				const laneSection = position.laneSection;

				const lane = position.lane;

				const location = this.tool.roadService.findLaneEndPosition( road, laneSection, lane, position.s )

				this.selectedNode.position.copy( location.toVector3() );

			}

			this.nodeMoved = true;

		} );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof LaneMarkingNode ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvLane ) {

			this.onLaneSelected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof LaneMarkingNode ) {

			this.addRoadMark( object.lane, object.roadmark );

		} else if ( object instanceof LaneMarkingInspector ) {

			this.addRoadMark( object.lane, object.roadmark );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof LaneMarkingNode ) {

			this.updateRoadMark( object.lane, object.roadmark );

		} else if ( object instanceof LaneMarkingInspector ) {

			this.updateRoadMark( object.lane, object.roadmark );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof LaneMarkingNode ) {

			this.removeRoadMark( object.lane, object.roadmark );

		} else if ( object instanceof LaneMarkingInspector ) {

			this.removeRoadMark( object.lane, object.roadmark );

		}
	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof LaneMarkingNode ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvLane ) {

			this.onLaneUnselected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		this.selectedRoad = road;

		this.tool.toolDebugger.setDebugState( road, DebugState.SELECTED );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.toolDebugger.setDebugState( road, DebugState.DEFAULT );

		this.selectedRoad = null;

	}

	onLaneSelected ( lane: TvLane ): void {

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		this.selectedLane = lane;

		this.selectedRoad = lane.laneSection.road;

		this.tool.toolDebugger.setDebugState( lane.laneSection.road, DebugState.SELECTED );

	}

	onLaneUnselected ( lane: TvLane ): void {

		this.tool.toolDebugger.setDebugState( lane.laneSection.road, DebugState.DEFAULT );

		this.selectedLane = null;

		this.selectedRoad = null;

	}

	onNodeSelected ( node: LaneMarkingNode ) {

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		node?.select();

		this.selectedNode = node;

		this.selectedLane = node.lane;

		this.selectedRoad = node.lane.laneSection.road;

		this.showInspector( node.lane, node.roadmark );

	}

	onNodeUnselected ( node: LaneMarkingNode ) {

		node?.unselect();

		this.selectedNode = null;

		AppInspector.clear();

	}

	showInspector ( lane: TvLane, roadmark: TvLaneRoadMark ) {

		const inspector = new LaneMarkingInspector( lane, roadmark );

		AppInspector.setInspector( DynamicInspectorComponent, inspector );

	}

	addRoadMark ( lane: TvLane, roadmark: TvLaneRoadMark ) {

		this.tool.addRoadmark( lane, roadmark );

		this.tool.toolDebugger.updateDebugState( lane.laneSection.road, DebugState.SELECTED );

		this.showInspector( lane, roadmark );

	}

	updateRoadMark ( lane: TvLane, roadmark: TvLaneRoadMark ) {

		this.tool.rebuild( lane );

		this.tool.toolDebugger.updateDebugState( lane.laneSection.road, DebugState.SELECTED );

		this.showInspector( lane, roadmark );

	}

	removeRoadMark ( lane: TvLane, roadmark: TvLaneRoadMark ) {

		this.tool.removeRoadmark( lane, roadmark );

		this.tool.toolDebugger.updateDebugState( lane.laneSection.road, DebugState.SELECTED );

		AppInspector.clear();

	}

}


