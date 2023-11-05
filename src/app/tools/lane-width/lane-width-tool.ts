/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/services/command-history';
import { PointerEventData } from '../../events/pointer-event-data';
import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { LaneWidthService } from './lane-width.service';
import { SelectLaneStrategy } from 'app/core/snapping/select-strategies/on-lane-strategy';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { AddObjectCommand, SelectObjectCommandv2 } from 'app/commands/select-point-command';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { MapEvents } from 'app/events/map-events';
import { SetValueCommand } from 'app/commands/set-value-command';

export class LaneWidthTool extends BaseTool {

	public name: string = 'LaneWidth';

	public toolType = ToolType.LaneWidth;

	// public laneHelper = new OdLaneReferenceLineBuilder();

	private nodeChanged: boolean = false;

	private selectedLane: TvLane;
	private selectedNode: LaneWidthNode;
	private oldValue: number;

	private debug = false;

	constructor ( private laneWidthService: LaneWidthService ) {

		super();

	}

	init () {

		this.laneWidthService.base.init();

		this.laneWidthService.base.addSelectionStrategy( new ControlPointStrategy( {
			higlightOnHover: true,
			higlightOnSelect: false,
			tag: LaneWidthNode.pointTag,
			returnParent: true,
		} ) );

		this.laneWidthService.base.addSelectionStrategy( new SelectLaneStrategy() );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.laneWidthService.removeAllWidthNodes()

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		if ( this.selectedNode ) this.onLaneWidthNodeUnselected( this.selectedNode );
	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.laneWidthService.base.select( e );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( !this.laneWidthService.base.onPointerDown( e ) ) return;

		if ( !this.selectedLane ) return;

		const node = this.laneWidthService.createWidthNode( this.selectedLane, e.point );

		const addCommand = new AddObjectCommand( node );

		const selectCommand = new SelectObjectCommandv2( node, this.selectedNode );

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

		this.laneWidthService.base.onPointerMoved( e );

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

			MapEvents.laneUpdated.emit( object.lane );
		}

	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof LaneWidthNode ) {

			this.laneWidthService.updateNode( object );

			MapEvents.laneUpdated.emit( object.lane );
		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectRemoved', object );

		if ( object instanceof LaneWidthNode ) {

			this.laneWidthService.removeNode( object );

			MapEvents.laneUpdated.emit( object.lane );

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

		this.selectedLane.select();

		this.laneWidthService.showWidthNodes( lane.laneSection.road );

		AppInspector.clear();

		this.setHint( 'use LEFT CLICK to select a node or use SHIFT + LEFT CLICK to add new node' );
	}

	onLaneUnselected ( lane: TvLane ): void {

		this.selectedLane = null;

		lane.unselect();

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

}
