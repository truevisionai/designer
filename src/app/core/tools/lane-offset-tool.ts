/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneOffsetNode } from 'app/modules/three-js/objects/control-point';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { CommandHistory } from 'app/services/command-history';
import { COLOR } from 'app/shared/utils/colors.service';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { CreateLaneOffsetCommand } from '../commands/create-lane-offset-command';
import { SelectLaneForLaneOffsetCommand } from '../commands/select-lane-for-lane-offset-command';
import { SelectLaneOffsetNodeCommand } from '../commands/select-lane-offset-node-command';
import { UnselectLaneForLaneOffsetCommand } from '../commands/unselect-lane-for-lane-offset-command';
import { UnselectLaneOffsetNodeCommand } from '../commands/unselect-lane-offset-node-command';
import { UpdateLaneOffsetDistanceCommand } from '../commands/update-lane-offset-distance-command';
import { KeyboardInput } from '../input';
import { ToolType } from '../models/tool-types.enum';
import { PickingHelper } from '../services/picking-helper.service';
import { BaseTool } from './base-tool';

export class LaneOffsetTool extends BaseTool {

	public name: string = 'LaneOffset';
	public toolType = ToolType.LaneOffset;

	public lane: TvLane;
	public node: LaneOffsetNode;

	public laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.MAGENTA );

	private nodeDistanceUpdated: boolean;

	init () {

		this.setHint( 'Use LEFT CLICK to select a road/lane' );

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.laneHelper?.clear();

		this.map.getRoads().forEach( road => road.hideLaneOffsetNodes() );
	}

	public onPointerDown ( e: PointerEventData ) {

		if ( e.button == MouseButton.RIGHT || e.button == MouseButton.MIDDLE ) return;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		if ( !shiftKeyDown && this.isNodeSelected( e ) ) return;

		if ( !shiftKeyDown && this.isLaneSelected( e ) ) return;

		if ( shiftKeyDown && e.point != null ) {

			const newLane = PickingHelper.checkLaneObjectInteraction( e );

			if ( !newLane ) return false;

			CommandHistory.execute( new CreateLaneOffsetCommand( this, newLane, e.point ) );

		} else if ( this.lane ) {

			CommandHistory.execute( new UnselectLaneForLaneOffsetCommand( this, this.lane ) );

		}
	}

	public onPointerMoved ( e: PointerEventData ) {

		this.updateNodeDistance( e );

	}

	public onPointerUp ( pointerEventData: PointerEventData ) {

		if ( this.nodeDistanceUpdated && this.node ) {

			const oldPosition = this.pointerDownAt.clone();					// starts position of pointer when down
			const newPosition = this.node?.point.position;					// end position of pointer when pointer up

			const oldCoord = this.node.road.getCoordAt( oldPosition );
			const newCoord = this.node.road.getCoordAt( newPosition );

			const command = new UpdateLaneOffsetDistanceCommand(
				this.node, newCoord.s, oldCoord.s, this.laneHelper
			);

			CommandHistory.execute( command );

			this.nodeDistanceUpdated = false;
		}

	}

	private isNodeSelected ( e: PointerEventData ): boolean {

		const point = PickingHelper.checkControlPointInteraction( e, LaneOffsetNode.pointTag, 1.0 );

		if ( !point || !point.parent ) return false;

		const node = point.parent as LaneOffsetNode;

		if ( !this.node || this.node.uuid !== node.uuid ) {

			CommandHistory.execute( new SelectLaneOffsetNodeCommand( this, node ) );

		}

		return true;
	}

	private isLaneSelected ( e: PointerEventData ): boolean {

		const newLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !newLane ) return false;

		if ( !this.lane || this.lane.roadId !== newLane.roadId ) {

			CommandHistory.execute( new SelectLaneForLaneOffsetCommand( this, newLane ) );

			this.setHint( 'Use LEFT CLICK to select a node or SHIFT + LEFT CLICK to add new node' );

		} else if ( this.node ) {

			CommandHistory.execute( new UnselectLaneOffsetNodeCommand( this, this.node ) );

			this.setHint( 'Use LEFT CLICK to select a node or SHIFT + LEFT CLICK to add new node' );

		}

		return true;
	}

	private updateNodeDistance ( e: PointerEventData ): void {

		if ( !this.isPointerDown ) return;

		if ( !this.lane || !this.node || !e.point ) return;

		const road = this.node.road;

		// new road should be same otherwise return
		if ( road.id !== this.node.road.id ) return;

		const roadCoord = road.getCoordAt( e.point );

		this.node?.updateScoordinate( roadCoord.s );

		this.nodeDistanceUpdated = true;

	}
}
