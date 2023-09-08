/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { Line } from 'three';
import { MouseButton, PointerEventData } from '../../../events/pointer-event-data';
import { AnyControlPoint } from '../../../modules/three-js/objects/control-point';
import { LaneRoadMarkNode } from '../../../modules/three-js/objects/lane-road-mark-node';
import { OdLaneReferenceLineBuilder } from '../../../modules/tv-map/builders/od-lane-reference-line-builder';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../../../modules/tv-map/models/tv-lane-road-mark';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { PickingHelper } from '../../services/picking-helper.service';
import { BaseTool } from '../base-tool';
import { AddRoadmarkNodeCommand } from './add-roadmark-node';
import { SelectLaneForRoadMarkCommand } from './select-lane-for-roadmark-command';
import { SelectRoadmarNodeCommand } from './select-roadmark-node-command';
import { UnselectLaneForRoadMarkCommand } from './unselect-lane-for-roadmark-command';
import { UnselectRoadmarkNodeCommand } from './unselect-roadmark-node-command';
import { UpdateRoadmarkNodeCommand } from './update-roadmark-node';
import { TvRoadMarkBuilderV2 } from 'app/modules/tv-map/builders/tv-road-mark-builder-v2';

export class LaneMarkingTool extends BaseTool {

	public name: string = 'LaneMarking';

	public toolType = ToolType.LaneMarking;

	public pointerObject: any;

	public markingDistanceChanged: boolean;

	public lane: TvLane;

	/**
	 * @deprecated
	 */
	public roadMark: TvLaneRoadMark;

	/**
	 * @deprecated
	 */
	public controlPoint: AnyControlPoint;

	public node: LaneRoadMarkNode;

	// public roadMarkBuilder = new OdRoadMarkBuilderV1();
	public roadMarkBuilder = new TvRoadMarkBuilderV2();

	public laneHelper = new OdLaneReferenceLineBuilder();

	constructor () {

		super();

	}

	get road () {

		return this.lane ? this.map.getRoadById( this.lane.roadId ) : null;

	}

	init () {

		this.setHint( 'Use LEFT CLICK to select road or lane' );

		super.init();

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		if ( this.laneHelper ) this.laneHelper.clear();

		this.map.getRoads().forEach( road => road.hideLaneMarkingNodes() );
	}

	public onPointerDown ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		if ( !shiftKeyDown && this.lane && this.isNodeSelected( e ) ) return;

		if ( shiftKeyDown && this.lane && this.hasCreatedNode( e ) ) return;

		if ( !shiftKeyDown && this.isLaneSelected( e ) ) return;

		if ( this.lane ) this.unselectLane( this.lane );
	}

	public onPointerUp ( e: PointerEventData ) {

		if ( e.button !== MouseButton.LEFT ) return;

		if ( this.markingDistanceChanged && this.node && this.pointerDownAt ) {

			// e.point is null for some reason, so use node position
			// const newPosition = e.point.clone();

			// use the current positino of the node as the new position
			const newPosition = this.node.point.position.clone();

			// old position is the location where the mouse was last down
			const oldPosition = this.pointerDownAt.clone();

			const command = new UpdateRoadmarkNodeCommand( this.node, newPosition, oldPosition, this.roadMarkBuilder );

			CommandHistory.execute( command );

		}

		this.pointerObject = null;

		this.markingDistanceChanged = false;
	}

	public onPointerMoved ( e: PointerEventData ) {

		this.highlightLaneMarkingLines( e );

		if ( this.isPointerDown && this.node && this.node.isSelected ) {

			this.markingDistanceChanged = true;

			// NodeFactoryService.updateRoadMarkNodeByPosition( this.node, e.point );
			this.node.updateByPosition( e.point );

		}
	}

	private highlightLaneMarkingLines ( e: PointerEventData ) {

		this.removeHighlight();

		if ( this.isPointerDown ) return;

		if ( !this.lane ) return;

		const results = PickingHelper.findAllByTag( this.laneHelper.tag, e, this.road.gameObject.children );

		if ( results.length > 0 ) {

			this.highlightLine( results[ 0 ] as Line );

		}
	}

	private isNodeSelected ( e: PointerEventData ): boolean {

		const interactedPoint = PickingHelper.checkControlPointInteraction( e, LaneRoadMarkNode.pointTag, 1.0 );

		if ( !interactedPoint ) return false;

		const node = interactedPoint.parent as LaneRoadMarkNode;

		if ( !this.node || this.node.id !== node.id ) {

			this.selectNode( node );

		}

		return interactedPoint != null;
	}

	private selectNode ( node: LaneRoadMarkNode ) {

		CommandHistory.execute( new SelectRoadmarNodeCommand( this, node ) );

	}

	private unselectNode ( node: LaneRoadMarkNode ) {

		CommandHistory.execute( new UnselectRoadmarkNodeCommand( this, node ) );

	}

	private isLaneSelected ( e: PointerEventData ): boolean {

		const newLane = this.isOnLane( e );

		if ( !newLane ) return false;

		if ( !this.lane || this.lane.uuid !== newLane.uuid ) {

			// new lane needs to be selected
			this.selectLane( newLane );

		} else if ( this.node ) {

			this.unselectNode( this.node );

		}

		return newLane != null;
	}

	private isOnLane ( e: PointerEventData ): TvLane | null {

		return PickingHelper.checkLaneObjectInteraction( e );

	}

	private selectLane ( lane: TvLane ) {

		const road = this.map.getRoadById( lane.roadId );

		if ( road.isJunction ) SnackBar.warn( 'LaneMark Editing on junction roads is currently not supported' );

		if ( road.isJunction ) return;

		this.setHint( 'Use LEFT CLICK to select a Lane Marking Node or use SHIFT + LEFT CLICK to add new Lane Marking Node' );

		CommandHistory.execute( new SelectLaneForRoadMarkCommand( this, lane ), );

	}

	private unselectLane ( lane: TvLane ) {

		CommandHistory.execute( new UnselectLaneForRoadMarkCommand( this, lane ) );

	}

	private hasCreatedNode ( e: PointerEventData ) {

		const interactedLane = this.isOnLane( e );

		if ( !interactedLane ) return;

		if ( interactedLane ) {

			this.setHint( 'Modify Lane Marking Node properties from the inspector like color, width etc' );

			CommandHistory.execute( new AddRoadmarkNodeCommand( this, interactedLane, e.point ) );

		}

		return interactedLane != null;
	}

	// private selectRoadMarkAt ( position: Vector3, lane: TvLane ) {

	// 	const posTheta = new TvPosTheta();

	// 	TvMapQueries.getRoadByCoords( position.x, position.y, posTheta );

	// 	const roadMark = lane.getRoadMarkAt( posTheta.s );

	// 	CommandHistory.executeAll( [

	// 		new SetValueCommand( this, 'roadMark', roadMark ),

	// 		new SetInspectorCommand( LaneRoadmarkInspectorComponent, roadMark ),

	// 	] );

	// }
}
