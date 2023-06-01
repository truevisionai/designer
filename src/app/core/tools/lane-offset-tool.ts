/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { AnyControlPoint, LaneOffsetNode} from 'app/modules/three-js/objects/control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { COLOR } from 'app/shared/utils/colors.service';
import { Subscription } from 'rxjs';
import { Object3D, Vector3 } from 'three';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { LaneWidthNode } from '../../modules/three-js/objects/lane-width-node';
import { TvLane } from '../../modules/tv-map/models/tv-lane';
import { TvMapQueries } from '../../modules/tv-map/queries/tv-map-queries';
import { AddLaneOffsetCommand } from '../commands/add-lane-offset-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { UpdateLaneOffsetDistanceCommand } from '../commands/update-lane-offset-distance-command';
import { UpdateLaneOffsetValueCommand } from '../commands/update-lane-offset-value-command';
import { NodeFactoryService } from '../factories/node-factory.service';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { SceneService } from '../services/scene.service';
import { BaseTool } from './base-tool';
import { BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { SetMultipleValuesCommand } from 'app/modules/three-js/commands/set-multiple-value-command';
import { CallFunctionCommand } from '../commands/call-function-command';
import { ToolType } from '../models/tool-types.enum';
import { SelectLaneForLaneOffsetCommand } from '../commands/select-lane-for-lane-offset-command';
import { SelectLaneOffsetNodeCommand } from '../commands/select-lane-offset-node-command';
import { UnselectLaneForRoadMarkCommand } from '../commands/unselect-lane-for-roadmark-command';
import { UnselectLaneForLaneOffsetCommand } from '../commands/unselect-lane-for-lane-offset-command';
import { UnselectLaneOffsetNodeCommand } from '../commands/unselect-lane-offset-node-command';

export class LaneOffsetTool extends BaseTool {

	public name: string = 'LaneOffset';
	public toolType = ToolType.LaneOffset;

	private distanceSub: Subscription;
	private offsetSub: Subscription;

	private laneWidthChanged: boolean = false;
	private pointerDown: boolean = false;
	private pointerObject: Object3D;

	public lane: TvLane;
	public node: LaneOffsetNode;

	private get road () {
		return this.lane ? this.map.getRoadById( this.lane.roadId ) : null;
	}

	public laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.MAGENTA );

	constructor () {

		super();

	}

	init () {


	}

	enable () {

		super.enable();

		// this.map.getRoads().forEach( road => road.showLaneOffsetNodes() );

		// this.distanceSub = LaneOffsetInspector.distanceChanged.subscribe( distance => {

		// 	CommandHistory.execute( new UpdateLaneOffsetDistanceCommand( this.node, distance, null, this.laneHelper ) );

		// } );


		// this.offsetSub = LaneOffsetInspector.offsetChanged.subscribe( offset => {

		// 	CommandHistory.execute( new UpdateLaneOffsetValueCommand( this.node, offset, null, this.laneHelper ) );

		// } );

	}

	disable () {

		super.disable();

		this.laneHelper?.clear();

		this.distanceSub?.unsubscribe();

		this.map.getRoads().forEach( road => road.hideLaneOffsetNodes() );
	}

	public onPointerDown ( e: PointerEventData ) {

		this.pointerDown = true;

		if ( e.button == MouseButton.RIGHT || e.button == MouseButton.MIDDLE ) return;

		// check for control point interactions first
		if ( !KeyboardInput.isShiftKeyDown && this.isNodeSelected( e ) ) return;

		// check for lane game object interactions
		if ( !KeyboardInput.isShiftKeyDown && this.isLaneSelected( e ) ) return;

		// no interaction, add new node
		if ( KeyboardInput.isShiftKeyDown && e.point != null && this.lane ) {

			this.addNode( this.lane, e.point );

		} else {

			this.clearSelection();

		}
	}

	public onPointerUp () {

		// this.pointerDown = false;

		// this.pointerObject = null;

		// this.laneWidthChanged = false;
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

		if ( !interactedPoint ) return false;

		const node = interactedPoint.parent as LaneOffsetNode;

		if ( !this.node || this.node.id !== node.id ) {

			CommandHistory.execute( new SelectLaneOffsetNodeCommand( this, node ) );

		}

		return interactedPoint != null;
	}

	private unselectNode ( node: LaneOffsetNode ) {

		CommandHistory.execute( new UnselectLaneOffsetNodeCommand( this, node ) );

	}

	private isLaneSelected ( e: PointerEventData ): boolean {

		const newLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !newLane ) return false;

		if ( !this.lane || this.lane.roadId !== newLane.roadId ) {

			CommandHistory.execute( new SelectLaneForLaneOffsetCommand( this, newLane ) )

		} else if ( this.node ) {

			this.unselectNode( this.node )

		}

		return newLane != null;
	}

	private addNode ( lane: TvLane, position: Vector3 ): void {

		CommandHistory.execute( new AddLaneOffsetCommand( this, lane, position ) );

	}

	private clearSelection () {

		// if everything is already null then return
		if ( this.node == null && this.lane == null ) return;

		CommandHistory.execute( new UnselectLaneForLaneOffsetCommand( this, this.lane ) );

	}

}
