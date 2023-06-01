/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { CommandHistory } from 'app/services/command-history';
import { Vector3 } from 'three';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { CreateWidthNodeCommand } from '../commands/create-lane-width-command';
import { SelectLaneForLaneWidthCommand } from '../commands/select-lane-for-lane-width-command';
import { SelectLaneWidthNodeCommand } from '../commands/select-lane-width-node-command';
import { UnselectLaneForLaneWidthCommand } from '../commands/unselect-lane-for-lane-width-command';
import { UnselectLaneWidthNodeCommand } from '../commands/unselect-lane-width-node-command';
import { UpdateWidthNodePositionCommand } from '../commands/update-width-node-position-command';
import { NodeFactoryService } from '../factories/node-factory.service';
import { KeyboardInput } from '../input';
import { ToolType } from '../models/tool-types.enum';
import { PickingHelper } from '../services/picking-helper.service';
import { BaseTool } from './base-tool';

export class LaneWidthTool extends BaseTool {

	public name: string = 'LaneWidth';
	public toolType = ToolType.LaneWidth;

	private laneWidthChanged: boolean = false;
	private pointerDown: boolean = false;
	private pointerDownAt: Vector3;

	private _lane: TvLane;
	private _node: LaneWidthNode;

	public laneHelper = new OdLaneReferenceLineBuilder( null, LineType.DASHED );

	constructor () {

		super();

	}

	get lane (): TvLane {
		return this._lane;
	}

	set lane ( value: TvLane ) {
		this._lane = value;
	}

	get node (): LaneWidthNode {
		return this._node;
	}

	set node ( value: LaneWidthNode ) {
		this._node = value;
	}

	init () {

		this.setHint( 'Click on a road to show lane width nodes' );

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.laneHelper.clear();

		this.map.getRoads().forEach( road => road.hideWidthNodes() );
	}

	public onPointerDown ( e: PointerEventData ) {

		if ( e.button === MouseButton.RIGHT || e.button === MouseButton.MIDDLE ) return;

		this.pointerDown = true;
		this.pointerDownAt = e.point;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		if ( !shiftKeyDown && this.checkNodePointInteraction( e ) ) return;

		if ( !shiftKeyDown && this.checkLaneObjectInteraction( e ) ) return;

		if ( shiftKeyDown && e.point != null ) {

			const lane = PickingHelper.checkLaneObjectInteraction( e );

			if ( !lane ) return false;

			CommandHistory.execute( new CreateWidthNodeCommand( this, lane, e.point ) );

			this.setHint( 'Click and drag on the lane width node to change its position' );


		} else if ( this._lane ) {

			CommandHistory.execute( new UnselectLaneForLaneWidthCommand( this, this._lane ) );

		}
	}

	public onPointerUp ( e ) {

		if ( this.laneWidthChanged && this._node ) {

			const newPosition = this._node.point.position.clone();

			const oldPosition = this.pointerDownAt.clone();

			CommandHistory.execute( new UpdateWidthNodePositionCommand( this._node, newPosition, oldPosition, this.laneHelper ) );

		}

		this.pointerDown = false;

		this.pointerDownAt = null;

		this.laneWidthChanged = false;
	}

	public onPointerMoved ( e: PointerEventData ) {

		if ( this.pointerDown && this._node ) {

			this.laneWidthChanged = true;

			NodeFactoryService.updateLaneWidthNode( this._node, e.point );

			this._node.updateLaneWidthValues();

			// this.updateLaneWidth( this.pointerObject.parent as LaneWidthNode );

			// if ( this.lane ) this.laneHelper.redraw( LineType.DASHED );

		}

		// else if ( this.pointerDown && this.pointerObject && this.pointerObject[ 'tag' ] == LaneWidthNode.lineTag ) {

		//     this.laneWidthChanged = true;

		//     NodeFactoryService.updateLaneWidthNode( this.pointerObject.parent as LaneWidthNode, e.point );

		//     this.updateLaneWidth( this.pointerObject.parent as LaneWidthNode );

		//     if ( this.lane ) this.laneHelper.redraw( LineType.DASHED );

		// }
	}

	// private checkReferenceLineInteraction ( e: PointerEventData ) {

	//     let hasInteracted = false;

	//     this.checkIntersection( this.laneHelper.tag, e.intersections, ( obj ) => {

	//         hasInteracted = true;

	//         this.laneHelper.onLineSelected( obj as Line );

	//     } );

	//     return hasInteracted;
	// }

	private checkNodePointInteraction ( e: PointerEventData ): boolean {

		// Check for control point interactions
		const interactedPoint = PickingHelper.checkControlPointInteraction( e, LaneWidthNode.pointTag );

		if ( !interactedPoint || !interactedPoint.parent ) return false;

		const newNode = interactedPoint.parent as LaneWidthNode;

		if ( !this._node || this._node.uuid !== newNode.uuid ) {

			CommandHistory.execute( new SelectLaneWidthNodeCommand( this, newNode ) );

		}

		return true;
	}

	private checkLaneObjectInteraction ( e: PointerEventData ): boolean {

		const newLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !newLane ) return false;

		if ( !this._lane || this._lane.roadId !== newLane.roadId ) {

			CommandHistory.execute( new SelectLaneForLaneWidthCommand( this, newLane ) );

		} else if ( this._node ) {

			CommandHistory.execute( new UnselectLaneWidthNodeCommand( this, this._node ) );

		}

		return true;
	}
}
