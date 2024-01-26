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
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { SetValueCommand } from 'app/commands/set-value-command';
import { DebugLine } from 'app/objects/debug-line';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";

export class LaneWidthTool extends BaseTool {

	public name: string = 'LaneWidth';

	public toolType = ToolType.LaneWidth;

	private nodeChanged: boolean = false;

	private selectedLane: TvLane;
	private selectedNode: LaneWidthNode;
	private oldValue: number;

	private debug = false;

	constructor ( private laneWidthService: LaneWidthToolService ) {

		super();

	}

	init () {

		this.laneWidthService.base.reset();

		this.laneWidthService.base.addSelectionStrategy( new ControlPointStrategy( {
			higlightOnHover: true,
			higlightOnSelect: false,
			tag: LaneWidthNode.pointTag,
			returnParent: true,
		} ) );

		this.laneWidthService.base.addSelectionStrategy( new SelectLineStrategy() );

		this.laneWidthService.base.addSelectionStrategy( new SelectLaneStrategy() );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.laneWidthService.base.reset();

		this.laneWidthService.removeAllWidthNodes()

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		if ( this.selectedNode ) this.onLaneWidthNodeUnselected( this.selectedNode );
	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.laneWidthService.base.handleSelection( e, selected => {

			if ( selected instanceof LaneWidthNode ) {

				if ( this.selectedNode === selected ) return;

				this.selectObject( selected, this.selectedNode );

			} else if ( selected instanceof DebugLine ) {

				if ( this.selectedNode === selected.target ) return;

				this.selectObject( selected.target, this.selectedNode );

			} else if ( selected instanceof TvLane ) {

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

		if ( !this.laneWidthService.base.onPointerDown( e ) ) return;

		if ( !this.selectedLane ) return;

		const node = this.laneWidthService.createWidthNode( this.selectedLane, e.point );

		const addCommand = new AddObjectCommand( node );

		const selectCommand = new SelectObjectCommand( node, this.selectedNode );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	onPointerUp ( e: PointerEventData ) {

		if ( !this.nodeChanged ) return;

		if ( !this.selectedNode ) return;

		if ( !this.oldValue ) return;

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

		this.laneWidthService.base.highlight( e );

		if ( !this.isPointerDown ) return;

		if ( !this.selectedNode ) return;

		if ( !this.laneWidthService.base.onPointerDown( e ) ) return;

		this.laneWidthService.updateByPosition( this.selectedNode, e.point );

		if ( !this.nodeChanged ) {
			this.oldValue = this.selectedNode.s;
		}

		this.nodeChanged = true;

	}

	onObjectAdded ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectAdded', object );

		if ( object instanceof LaneWidthNode ) {

			this.laneWidthService.addNode( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof LaneWidthNode ) {

			this.laneWidthService.updateNode( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectRemoved', object );

		if ( object instanceof LaneWidthNode ) {

			this.laneWidthService.removeNode( object );

		}

	}

	onObjectSelected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectSelected', object );

		this.laneWidthService.base.setSelected( object );

		if ( object instanceof TvLane ) {

			this.onLaneSelected( object );


		} else if ( object instanceof LaneWidthNode ) {

			this.onLaneWidthNodeSelected( object );
		}

	}

	onObjectUnselected ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUnselected', object );

		if ( object instanceof TvLane ) {

			this.onLaneUnselected( object );

		} else if ( object instanceof LaneWidthNode ) {

			this.onLaneWidthNodeUnselected( object );

		}

	}

	onLaneSelected ( lane: TvLane ): void {

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		this.selectedLane = lane;

		// this.selectedLane.select();

		this.laneWidthService.showWidthNodes( lane.laneSection.road );

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );
	}

	onLaneUnselected ( lane: TvLane ): void {

		this.selectedLane = null;

		// lane.unselect();

		this.laneWidthService.hideWidthNodes( lane.laneSection.road );

		this.setHint( 'use LEFT CLICK to select a road/lane' );
	}

	onLaneWidthNodeSelected ( node: LaneWidthNode ): void {

		if ( this.selectedNode ) this.onLaneWidthNodeUnselected( this.selectedNode );

		this.selectedNode = node;

		this.laneWidthService.selectNode( node );

		AppInspector.setInspector( DynamicInspectorComponent, node );

		this.setHint( 'Drag node to modify position. Change properties from inspector' );
	}

	onLaneWidthNodeUnselected ( node: LaneWidthNode ): void {

		this.selectedNode = null;

		this.laneWidthService.unselectNode( node );

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );

	}

	onDeleteKeyDown () {

		if ( !this.selectedNode ) return;

		this.executeRemoveObject( this.selectedNode );

	}

}
