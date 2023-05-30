/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { AnyControlPoint, LaneOffsetNode, LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { COLOR } from 'app/shared/utils/colors.service';
import { LaneOffsetInspector, LaneOffsetInspectorData } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';
import { Subscription } from 'rxjs';
import { Object3D, Vector3 } from 'three';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
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

export class LaneOffsetTool extends BaseTool {

	public name: string = 'LaneOffset';
	public toolType = ToolType.LaneOffset;

	private distanceSub: Subscription;
	private offsetSub: Subscription;

	private laneWidthChanged: boolean = false;
	private pointerDown: boolean = false;
	private pointerObject: Object3D;

	public lane: TvLane;
	public controlPoint: AnyControlPoint;
	public node: LaneOffsetNode;

	private get road () {
		return this.lane ? this.map.getRoadById( this.lane.roadId ) : null;
	}

	private laneHelper = new OdLaneReferenceLineBuilder( null, LineType.SOLID, COLOR.MAGENTA );

	constructor () {

		super();

	}

	init () {


	}

	enable () {

		super.enable();

		// optional as nodes show up when road/lane is
		// this.map.roads.forEach( road => this.showNodes( road ) );

		this.distanceSub = LaneOffsetInspector.distanceChanged.subscribe( distance => {

			CommandHistory.execute( new UpdateLaneOffsetDistanceCommand( this.node, distance, null, this.laneHelper ) );

		} );


		this.offsetSub = LaneOffsetInspector.offsetChanged.subscribe( offset => {

			CommandHistory.execute( new UpdateLaneOffsetValueCommand( this.node, offset, null, this.laneHelper ) );

		} );

	}

	disable () {

		super.disable();

		if ( this.laneHelper ) this.laneHelper.clear();

		this.distanceSub.unsubscribe();

		this.map.getRoads().forEach( road => road.hideLaneOffsetNodes() );
	}

	public onPointerDown ( e: PointerEventData ) {

		this.pointerDown = true;

		// keep in either clicked or down

	}

	public onPointerClicked ( e: PointerEventData ) {

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

		this.pointerDown = false;

		this.pointerObject = null;

		this.laneWidthChanged = false;
	}

	public onPointerMoved ( e: PointerEventData ) {

		if ( this.pointerDown && this.node ) {

			this.laneWidthChanged = true;

			const newPosition = new TvPosTheta();

			const road = TvMapQueries.getRoadByCoords( e.point.x, e.point.y, newPosition );

			// new road should be same
			if ( road.id === this.node.road.id ) {

				const command = ( new UpdateLaneOffsetDistanceCommand( this.node, newPosition.s, null, this.laneHelper ) );

				command.execute();

			}

		}
	}

	private isNodeSelected ( e: PointerEventData ): boolean {

		// // first chceck for control point interactions
		// // doing in 2 loop to prioritise control points
		const interactedPoint = PickingHelper.checkControlPointInteraction( e, LaneOffsetNode.pointTag, 1.0 );

		if ( !interactedPoint ) return false;

		if ( !this.controlPoint || this.controlPoint.id !== interactedPoint.id ) {

			this.selectPoint( interactedPoint );

		}

		return interactedPoint != null;
	}

	private selectPoint ( point: BaseControlPoint ) {

		const node = point.parent as LaneOffsetNode;

		const road = this.map.getRoadById( node.roadId );

		CommandHistory.executeMany(

			new SetMultipleValuesCommand<LaneOffsetTool>( this, {
				controlPoint: point,
				node: node,
			} ),

			new SetInspectorCommand( LaneOffsetInspector, new LaneOffsetInspectorData( node, road ) ),
		);

	}

	private unselectPoint ( point: BaseControlPoint ) {

		CommandHistory.executeMany(

			new SetValueCommand( this, 'controlPoint', null ),

			new SetValueCommand( this, 'node', null ),

			new SetInspectorCommand( null, null ),
		);

	}

	private isLaneSelected ( e: PointerEventData ): boolean {

		const interactedLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( !interactedLane ) return false;

		if ( interactedLane ) {

			this.selectLane( interactedLane );

		}

		return interactedLane != null;
	}

	private selectLane ( lane: TvLane ) {

		// return if lane is of the same road
		if ( this.lane && this.lane.roadId == lane.roadId ) return;

		const road = this.map.getRoadById( lane.roadId );

		CommandHistory.executeMany(

			new CallFunctionCommand<LaneOffsetTool>( this, this.showNodes, [ road ], this.hideNodes, [ road ] ),

			new SetValueCommand( this, 'lane', lane ),

			new SetInspectorCommand( LaneOffsetInspector, new LaneOffsetInspectorData( null, road ) ),

		);
	}

	private addNode ( lane: TvLane, position: Vector3 ): void {

		CommandHistory.execute( new AddLaneOffsetCommand( this, lane, position ) );

	}

	private showNodes ( road: TvRoad ) {

		road.getLaneOffsets().forEach( laneOffset => {

			if ( laneOffset.mesh ) {

				laneOffset.mesh.visible = true;

			} else {

				laneOffset.mesh = NodeFactoryService.createLaneOffsetNode( road, laneOffset );

				SceneService.add( laneOffset.mesh );

			}

		} );

	}

	private hideNodes ( road: TvRoad ) {

		road.hideLaneOffsetNodes();

	}

	private clearSelection () {

		this.road?.hideLaneOffsetNodes();

		// if everything is already null then return
		if ( this.node == null && this.controlPoint == null && this.lane == null ) return;

		CommandHistory.executeMany(

			new SetMultipleValuesCommand<LaneOffsetTool>( this, {
				lane: null,
				controlPoint: null,
				node: null,
			} ),

			new SetInspectorCommand( null, null ),
		);

	}

}
