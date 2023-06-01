/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetMultipleValuesCommand } from 'app/modules/three-js/commands/set-multiple-value-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { race } from 'rxjs-compat/operator/race';
import { Vector3 } from 'three';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { AnyControlPoint, BaseControlPoint, LaneRoadMarkNode } from '../../modules/three-js/objects/control-point';
import { OdLaneReferenceLineBuilder } from '../../modules/tv-map/builders/od-lane-reference-line-builder';
import { OdRoadMarkBuilder } from '../../modules/tv-map/builders/od-road-mark-builder';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from '../../modules/tv-map/models/tv-lane-road-mark';
import { TvPosTheta } from '../../modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { LaneRoadmarkInspectorComponent } from '../../views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';
import { AddRoadmarkNodeCommand } from '../commands/add-roadmark-node';
import { MultiCmdsCommand } from '../commands/multi-cmds-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { ShowLaneMarkingCommand } from '../commands/show-lane-marking-command';
import { UpdateRoadmarkNodeCommand } from '../commands/update-roadmark-node';
import { NodeFactoryService } from '../factories/node-factory.service';
import { KeyboardInput } from '../input';
import { AppInspector } from '../inspector';
import { PickingHelper } from '../services/picking-helper.service';
import { SceneService } from '../services/scene.service';
import { BaseTool } from './base-tool';
import { ToolType } from '../models/tool-types.enum';

// TODO
// 1. better node selection
// 2. node moves even after road is unselected
// 3. shift + left click does not work sometimes
// 4. buggy experience when adding the node only adds when near line
export class LaneMarkingTool extends BaseTool {

	public name: string = 'LaneMarking';
	public toolType = ToolType.LaneMarking;

	public pointerDown: boolean;

	public pointerDownAt: Vector3;

	public pointerObject: any;

	public markingDistanceChanged: boolean;

	public lane: TvLane;

	public roadMark: TvLaneRoadMark;

	public controlPoint: AnyControlPoint;

	public node: LaneRoadMarkNode;

	private roadMarkBuilder = new OdRoadMarkBuilder();

	public laneHelper = new OdLaneReferenceLineBuilder( null );

	constructor () {

		super();

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

		this.pointerDown = true;

		if ( e.button === MouseButton.RIGHT || e.button === MouseButton.MIDDLE ) return;

		this.pointerDownAt = e.point ? e.point.clone() : null;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		if ( shiftKeyDown && this.isReferenceLineSelected( e ) ) return;

		if ( !shiftKeyDown && this.isNodeSelected( e ) ) return;

		if ( !shiftKeyDown && this.isLaneSelected( e ) ) return;

		this.clearSelection();
	}

	private clearSelection () {

		// if everything is already null then return
		if ( this.node == null && this.controlPoint == null && this.lane == null ) {

			return;
		}

		if ( this.lane ) {

			const road = this.map.getRoadById( this.lane.roadId );

			if ( road ) road.hideLaneMarkingNodes();

		}

		this.laneHelper.clear();

		CommandHistory.executeMany(

			new SetMultipleValuesCommand<LaneMarkingTool>( this, {
				lane: null,
				controlPoint: null,
				node: null,
			} ),

			new SetInspectorCommand( null, null ),
		);

	}

	public onPointerUp ( e: PointerEventData ) {

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

		this.pointerDown = false;

		this.pointerDownAt = null;

		this.pointerObject = null;

		this.markingDistanceChanged = false;
	}

	public onPointerMoved ( e: PointerEventData ) {

		if ( this.pointerDown && this.node && this.node.point.isSelected ) {

			this.markingDistanceChanged = true;

			NodeFactoryService.updateRoadMarkNodeByPosition( this.node, e.point );

		}
	}

	private isNodeSelected ( e: PointerEventData ): boolean {

		const interactedPoint = PickingHelper.checkControlPointInteraction( e, LaneRoadMarkNode.pointTag, 1.0 );

		if ( !interactedPoint ) return false;

		// Select the point if no node is selected or a new node is selected
		if ( !this.controlPoint || this.controlPoint.id !== interactedPoint.id ) {

			this.selectPoint( interactedPoint );

		}

		return interactedPoint != null;
	}

	private selectPoint ( point: BaseControlPoint ) {

		const node = point.parent as LaneRoadMarkNode;

		const roadMark = node.roadmark;

		CommandHistory.executeMany(

			new SetMultipleValuesCommand<LaneMarkingTool>( this, {
				controlPoint: point, node: node,
			} ),

			new SetInspectorCommand( LaneRoadmarkInspectorComponent, roadMark ),
		);

	}

	private isLaneSelected ( e: PointerEventData ): boolean {

		const interactedLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !interactedLane ) return false;

		if ( !this.lane || this.lane.uuid !== interactedLane.uuid ) {

			this.selectLane( interactedLane );

		}

		return interactedLane != null;
	}

	private selectLane ( lane: TvLane ) {

		const road = this.map.getRoadById( lane.roadId );

		if ( road.isJunction ) SnackBar.error( 'LaneMark Editing on junction roads is currently not supported' );

		if ( road.isJunction ) return;

		this.setHint( 'Use LEFT CLICK to select a Lane Marking Node or use SHIFT + LEFT CLICK to add new Lane Marking Node' );

		CommandHistory.execute( new ShowLaneMarkingCommand( this, lane ) );
	}

	private isReferenceLineSelected ( e: PointerEventData ) {

		const interactedLane = PickingHelper.checkReferenceLineInteraction( e, this.laneHelper.tag );

		if ( !interactedLane ) return;

		if ( interactedLane ) {

			this.addRoadmarkNodeAt( interactedLane, e.point );

		}

		return interactedLane != null;
	}

	private addRoadmarkNodeAt ( lane: TvLane, position: Vector3 ) {

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		TvMapQueries.getRoadByCoords( position.x, position.y, posTheta );

		// get the exisiting lane road mark at s and clone it
		const roadMark = lane.getRoadMarkAt( posTheta.s ).clone( posTheta.s );

		roadMark.node = NodeFactoryService.createRoadMarkNode( lane, roadMark );

		this.setHint( 'Modify Lane Marking Node properties from the inspector like color, width etc' );

		CommandHistory.executeAll( [

			new AddRoadmarkNodeCommand( lane, roadMark, this.roadMarkBuilder ),

			new SetValueCommand( this, 'roadMark', roadMark ),

			new SetValueCommand( this, 'lane', lane ),

			new SetInspectorCommand( LaneRoadmarkInspectorComponent, roadMark ),

		] );

	}

	private selectRoadMarkAt ( position: Vector3, lane: TvLane ) {

		const posTheta = new TvPosTheta();

		TvMapQueries.getRoadByCoords( position.x, position.y, posTheta );

		const roadMark = lane.getRoadMarkAt( posTheta.s );

		CommandHistory.executeAll( [

			new SetValueCommand( this, 'roadMark', roadMark ),

			new SetInspectorCommand( LaneRoadmarkInspectorComponent, roadMark ),

		] );

	}
}
