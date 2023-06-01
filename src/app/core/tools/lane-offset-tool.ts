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

		// if ( this.pointerDown && this.node ) {

		// 	this.laneWidthChanged = true;

		// 	const newPosition = new TvPosTheta();

		// 	const road = TvMapQueries.getRoadByCoords( e.point.x, e.point.y, newPosition );

		// 	// new road should be same
		// 	if ( road.id === this.node.road.id ) {

		// 		const command = ( new UpdateLaneOffsetDistanceCommand( this.node, newPosition.s, null, this.laneHelper ) );

		// 		command.execute();

		// 	}

		// }
	}

	private isNodeSelected ( e: PointerEventData ): boolean {

		// // first chceck for control point interactions
		// // doing in 2 loop to prioritise control points
		const interactedPoint = PickingHelper.checkControlPointInteraction( e, LaneOffsetNode.pointTag, 1.0 );

		if ( !interactedPoint || !interactedPoint.parent ) return false;

		const node = interactedPoint.parent as LaneOffsetNode;

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

}
