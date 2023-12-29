/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from '../../events/pointer-event-data';
import { LaneMarkingNode } from '../../modules/three-js/objects/lane-road-mark-node';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { LaneMarkingService } from './lane-marking.service';
import { CommandHistory } from 'app/services/command-history';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { SelectLineStrategy } from 'app/core/snapping/select-strategies/select-line-strategy';
import { AppInspector } from 'app/core/inspector';
import { DynamicInspectorComponent } from 'app/views/inspectors/dynamic-inspector/dynamic-inspector.component';
import { SelectLaneStrategy } from 'app/core/snapping/select-strategies/on-lane-strategy';
import { EndLaneMovingStrategy } from 'app/core/snapping/move-strategies/end-lane.moving.strategy';
import { WorldPosition } from 'app/modules/scenario/models/positions/tv-world-position';
import { SetValueCommand } from 'app/commands/set-value-command';
import { AddObjectCommand } from "../../commands/add-object-command";
import { UnselectObjectCommand } from "../../commands/unselect-object-command";
import { SelectObjectCommand } from "../../commands/select-object-command";

export class LaneMarkingTool extends BaseTool {

	public name: string = 'LaneMarking';

	public toolType = ToolType.LaneMarking;

	public nodeMoved: boolean;

	public selectedRoad: TvRoad;

	public selectedLane: TvLane;

	public selectedNode: LaneMarkingNode;

	private debug: boolean = false;

	private sOld: number;

	constructor ( private laneMarkingService: LaneMarkingService ) {

		super();

	}

	init () {

		this.setHint( 'Use LEFT CLICK to select road or lane' );

		this.laneMarkingService.base.reset();

		this.laneMarkingService.base.addSelectionStrategy( new ControlPointStrategy( {
			higlightOnHover: true,
			higlightOnSelect: false,
			returnParent: false,
		} ) );

		this.laneMarkingService.base.addSelectionStrategy( new SelectLineStrategy( {
			higlightOnHover: true,
			higlightOnSelect: true,
			tag: null,
			returnParent: false,
			returnTarget: true,
		} ) );

		this.laneMarkingService.base.addSelectionStrategy( new SelectLaneStrategy( false ) );

		this.laneMarkingService.base.addMovingStrategy( new EndLaneMovingStrategy() );

		this.setHint( 'use LEFT CLICK to select a road/lane' );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.laneMarkingService.base.reset();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

	}

	onPointerDownSelect ( e: PointerEventData ) {

		this.laneMarkingService.base.handleSelection( e, selected => {

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

		if ( !this.laneMarkingService.base.onPointerDown( e ) ) return;

		if ( !this.selectedLane ) return;

		const roadCoord = this.selectedRoad.getPosThetaByPosition( e.point );

		const s = roadCoord.s - this.selectedLane.laneSection.s;

		let currentMarking = this.selectedLane.getRoadMarkAt( s );

		if ( !currentMarking ) {
			currentMarking = this.selectedLane.addDefaultRoadMark()
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

		this.laneMarkingService.base.highlight( e );

		if ( !this.isPointerDown ) return;

		if ( !this.selectedNode ) return

		this.laneMarkingService.base.handleTargetMovement( e, this.selectedNode.lane, position => {

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

			this.laneMarkingService.addNode( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof LaneMarkingNode ) {

			this.laneMarkingService.updateNode( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.debug ) console.log( 'onObjectUpdated', object );

		if ( object instanceof LaneMarkingNode ) {

			this.laneMarkingService.removeNode( object );

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

		this.laneMarkingService.showRoad( road );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.laneMarkingService.hideRoad( road );

		this.selectedRoad = null;

	}

	onLaneSelected ( lane: TvLane ): void {

		if ( this.selectedLane ) this.onLaneUnselected( this.selectedLane );

		this.selectedLane = lane;

		this.selectedRoad = lane.laneSection.road;

		this.laneMarkingService.showRoad( lane.laneSection.road );

	}

	onLaneUnselected ( lane: TvLane ): void {

		this.laneMarkingService.hideRoad( lane.laneSection.road );

		this.selectedLane = null;

		this.selectedRoad = null;

	}

	onNodeSelected ( node: LaneMarkingNode ) {

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		node?.select();

		this.selectedNode = node;

		this.selectedLane = node.lane;

		this.selectedRoad = node.lane.laneSection.road;

		AppInspector.setInspector( DynamicInspectorComponent, node );
	}

	onNodeUnselected ( node: LaneMarkingNode ) {

		node?.unselect();

		this.selectedNode = null;

		AppInspector.clear();

	}

}
