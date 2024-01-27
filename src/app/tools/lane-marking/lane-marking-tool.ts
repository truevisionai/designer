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
import { WorldPosition } from 'app/scenario/models/positions/tv-world-position';
import { SetValueCommand } from 'app/commands/set-value-command';
import { AddObjectCommand } from "../../commands/add-object-command";
import { UnselectObjectCommand } from "../../commands/unselect-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";
import { TvLaneRoadMark } from 'app/map/models/tv-lane-road-mark';
import { Environment } from 'app/core/utils/environment';
import { LaneMarkingInspector } from './lane-marking.inspector';

export class LaneMarkingTool extends BaseTool<any>{

	public name: string = 'LaneMarking';

	public toolType = ToolType.LaneMarking;

	public nodeMoved: boolean;

	public selectedRoad: TvRoad;

	public selectedLane: TvLane;

	public selectedNode: LaneMarkingNode;

	private debug: boolean = !Environment.production;

	private sOld: number;

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

		this.tool.base.addSelectionStrategy( new SelectLaneStrategy( false ) );

		this.tool.base.addMovingStrategy( new EndLaneMovingStrategy() );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

	}

	onPointerDownSelect ( e: PointerEventData ) {

		this.tool.base.handleSelection( e, selected => {

			if ( selected instanceof LaneMarkingNode ) {

				if ( this.selectedNode === selected ) return;

				CommandHistory.execute( new SelectObjectCommand( selected, this.selectedNode ) );

			}

			else if ( selected instanceof TvLane ) {

				if ( this.selectedLane === selected ) return;

				CommandHistory.execute( new SelectObjectCommand( selected, this.selectedLane ) );

			}

		}, () => {

			if ( this.selectedNode ) {

				CommandHistory.execute( new UnselectObjectCommand( this.selectedNode ) );

			} else if ( this.selectedLane ) {

				CommandHistory.execute( new UnselectObjectCommand( this.selectedLane ) );

			}

		} );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.tool.base.onPointerDown( e ) ) return;

		if ( !this.selectedLane ) return;

		const roadCoord = this.selectedRoad.getPosThetaByPosition( e.point );

		const s = roadCoord.s - this.selectedLane.laneSection.s;

		let currentMarking = this.selectedLane.getRoadMarkAt( s );

		if ( !currentMarking ) {
			currentMarking = this.selectedLane.addNoneRoadMark()
		}

		const marking = currentMarking.clone( s );

		const node = new LaneMarkingNode( this.selectedLane, marking );

		const addCommand = new AddObjectCommand( node );

		const selectCommand = new SelectObjectCommand( node, this.selectedNode );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onPointerUp ( e: PointerEventData ) {

		if ( !this.selectedNode ) return

		if ( !this.nodeMoved ) return;

		if ( !this.pointerDownAt ) return;

		const newPosition = this.selectedNode.position.clone();

		const posTheta = this.selectedLane.laneSection.road.getPosThetaByPosition( newPosition );

		const sCurrent = posTheta.s - this.selectedLane.laneSection.s;

		CommandHistory.execute( new SetValueCommand( this.selectedNode, 's', sCurrent, this.sOld ) );

		this.nodeMoved = false;

		this.sOld = null;
	}

	onPointerMoved ( e: PointerEventData ) {

		this.tool.base.highlight( e );

		if ( !this.isPointerDown ) return;

		if ( !this.selectedNode ) return

		this.tool.base.handleTargetMovement( e, this.selectedNode.lane, position => {

			if ( !this.sOld ) this.sOld = this.selectedNode.s;

			if ( position instanceof WorldPosition ) {

				this.selectedNode.position.copy( position.position );

			}

			this.nodeMoved = true;

		} );

	}

	onObjectSelected ( object: any ): void {

		if ( object instanceof LaneMarkingNode ) {

			this.onNodeSelected( object );

		}

		else if ( object instanceof TvLane ) {

			this.onLaneSelected( object );

		}

		else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		}

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectAdded', object );

		if ( object instanceof LaneMarkingNode ) {

			this.tool.addNode( object );

		} else if ( object instanceof LaneMarkingInspector ) {

			this.tool.addRoadmark( object.lane, object.roadmark );

			this.showInspector( object.lane, object.roadmark );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof LaneMarkingNode ) {

			this.tool.updateNode( object );

		} else if ( object instanceof LaneMarkingInspector ) {

			this.tool.rebuild( object.lane );

			this.showInspector( object.lane, object.roadmark );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof LaneMarkingNode ) {

			this.tool.removeNode( object );

		} else if ( object instanceof LaneMarkingInspector ) {

			this.tool.removeRoadmark( object.lane, object.roadmark );

			AppInspector.clear();

		}
	}

	onObjectUnselected ( object: any ): void {

		if ( object instanceof LaneMarkingNode ) {

			this.onNodeUnselected( object );

		}

		else if ( object instanceof TvLane ) {

			this.onLaneUnselected( object );

		}

		else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		this.selectedRoad = road;

		this.tool.showRoad( road );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.hideRoad( road );

		this.selectedRoad = null;

	}

	onLaneSelected ( lane: TvLane ): void {

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		this.selectedLane = lane;

		this.selectedRoad = lane.laneSection.road;

		this.tool.showRoad( lane.laneSection.road );

	}

	onLaneUnselected ( lane: TvLane ): void {

		this.tool.hideRoad( lane.laneSection.road );

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

}


