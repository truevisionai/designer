/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { AnyControlPoint, LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { CommandHistory } from 'app/services/command-history';
import { LaneWidthInspector } from 'app/views/inspectors/lane-width-inspector/lane-width-inspector.component';
import { Subscription } from 'rxjs';
import { Vector3 } from 'three';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { AddWidthNodeCommand } from '../commands/add-width-node-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { UpdateWidthNodePositionCommand } from '../commands/update-width-node-position-command';
import { UpdateWidthNodeValueCommand } from '../commands/update-width-node-value-command';
import { NodeFactoryService } from '../factories/node-factory.service';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { BaseTool } from './base-tool';
import { AppInspector } from '../inspector';

export class LaneWidthTool extends BaseTool {

	public name: string = 'LaneWidth';

	private laneWidthChanged: boolean = false;
	private pointerDown: boolean = false;
	private pointerDownAt: Vector3;

	public lane: TvLane;
	public controlPoint: AnyControlPoint;
	public widthNode: LaneWidthNode;

	private laneHelper = new OdLaneReferenceLineBuilder( null, LineType.DASHED );

	constructor () {

		super();

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

		// Check for control point interactions first
		if ( !shiftKeyDown && this.checkNodePointInteraction( e ) ) {
			return;
		}

		// check for lane game object interactions
		const hasInteracted = this.checkLaneObjectInteraction( e );

		if ( hasInteracted ) return;

		const commands = [];

		if ( this.widthNode )
			commands.push( new SetValueCommand( this, 'widthNode', null ) );

		if ( this.lane )
			commands.push( new SetValueCommand( this, 'lane', null ) );

		if ( this.controlPoint )
			commands.push( new SetValueCommand( this, 'controlPoint', null ) );

		if ( AppInspector.currentInspector instanceof LaneWidthInspector )
			commands.push( new SetInspectorCommand( null, null ) );

		if ( commands.length > 0 )
			CommandHistory.executeMany( ...commands );
	}

	public onPointerClicked ( e: PointerEventData ) {

		if ( e.button === MouseButton.LEFT && KeyboardInput.isShiftKeyDown && e.point != null ) {

			this.addNode( e.point );

		}
	}

	public onPointerUp ( e ) {

		if ( this.laneWidthChanged && this.widthNode ) {

			const newPosition = this.widthNode.point.position.clone();

			const oldPosition = this.pointerDownAt.clone();

			CommandHistory.execute( new UpdateWidthNodePositionCommand( this.widthNode, newPosition, oldPosition, this.laneHelper ) );

		}

		this.pointerDown = false;

		this.pointerDownAt = null;

		this.laneWidthChanged = false;
	}

	public onPointerMoved ( e: PointerEventData ) {

		if ( this.pointerDown && this.widthNode ) {

			this.laneWidthChanged = true;

			NodeFactoryService.updateLaneWidthNode( this.widthNode, e.point );

			this.widthNode.updateLaneWidthValues();

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

		// If there's no control point interaction,
		// reset controlPoint if needed and return false
		if ( !interactedPoint ) {
			return false;
		}

		// Ensure the controlPoint has a parent before proceeding
		if ( !interactedPoint.parent ) {
			return false;
		}

		const laneWidthNode = interactedPoint.parent as LaneWidthNode;

		const commands = [];

		// Check if controlPoint or widthNode are different before pushing commands
		if ( this.controlPoint !== interactedPoint ) {
			commands.push( new SetValueCommand( this, 'controlPoint', interactedPoint ) );
		}

		if ( this.widthNode !== laneWidthNode ) {
			commands.push( new SetValueCommand( this, 'widthNode', laneWidthNode ) );
		}

		if ( this.controlPoint !== interactedPoint || this.widthNode !== laneWidthNode ) {
			commands.push( new SetInspectorCommand( LaneWidthInspector, { node: laneWidthNode } ) );
		}

		if ( commands.length > 0 ) CommandHistory.executeMany( ...commands );

		return true;
	}

	private checkLaneObjectInteraction ( e: PointerEventData ): boolean {

		let hasInteracted = false;

		for ( const intersection of e.intersections ) {

			// Check if the intersection object has the desired 'tag'
			if ( intersection.object && intersection.object[ 'tag' ] === ObjectTypes.LANE ) {

				hasInteracted = true;

				if ( intersection.object.userData.lane ) {

					const newLane = intersection.object.userData.lane as TvLane;

					// Check if it's a new lane or the same lane
					if ( !this.lane || this.lane.id !== newLane.id || this.lane.roadId !== newLane.roadId ) {

						this.setHint( 'Use SHIFT + LEFT CLICK on a lane to to add a new lane width node');

						CommandHistory.executeMany(
							new SetValueCommand( this, 'lane', newLane ),
							new SetInspectorCommand( LaneWidthInspector, { lane: newLane } ),
						);
					}
				}

				break;

			}

		}

		return hasInteracted;
	}


	private addNode ( position: Vector3 ): void {

		if ( !this.lane ) return;

		const road = this.map.getRoadById( this.lane.roadId );

		const laneWidthNode = NodeFactoryService.createLaneWidthNodeByPosition( road, this.lane, position );

		if ( !laneWidthNode ) throw new Error( "Could not create lane width node" );

		if ( !this.laneHelper ) throw new Error( "Lane helper is not defined" );

		this.setHint( 'Click and drag on the lane width node to change its position');

		CommandHistory.executeMany(

			new SetValueCommand( this, 'widthNode', laneWidthNode ),

			new AddWidthNodeCommand( laneWidthNode, this.laneHelper ),

			new SetInspectorCommand( LaneWidthInspector, { node: laneWidthNode } ),
		);
	}

}
