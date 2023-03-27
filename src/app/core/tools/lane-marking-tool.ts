/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { Vector3 } from 'three';
import { MouseButton, PointerEventData } from '../../events/pointer-event-data';
import { AnyControlPoint, LaneRoadMarkNode } from '../../modules/three-js/objects/control-point';
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
import { PickingHelper } from '../services/picking-helper.service';
import { SceneService } from '../services/scene.service';
import { BaseTool } from './base-tool';

export class LaneMarkingTool extends BaseTool {

	public name: string = 'LaneMarking';

	public pointerDown: boolean;

	public pointerDownAt: Vector3;

	public pointerObject: any;

	public markingDistanceChanged: boolean;

	private lane: TvLane;

	private roadMark: TvLaneRoadMark;

	private controlPoint: AnyControlPoint;

	private node: LaneRoadMarkNode;

	private roadMarkBuilder = new OdRoadMarkBuilder();

	private laneHelper = new OdLaneReferenceLineBuilder( null );

	constructor () {

		super();

	}

	init () {

		super.init();

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		if ( this.laneHelper ) this.laneHelper.clear();

		this.map.roads.forEach( road => this.hideNodes( road ) );
	}

	public onPointerDown ( e: PointerEventData ) {

		this.pointerDown = true;

		if ( e.button === MouseButton.RIGHT || e.button === MouseButton.MIDDLE ) return;

		this.pointerDownAt = e.point ? e.point.clone() : null;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		let hasInteracted = false;

		if ( !shiftKeyDown && !hasInteracted ) hasInteracted = this.checkNodePointInteraction( e );

		if ( !hasInteracted ) hasInteracted = this.checkReferenceLineInteraction( e );

		if ( !hasInteracted ) hasInteracted = this.checkLaneObjectInteraction( e );

		if ( !hasInteracted ) {

			this.node = null;

			this.lane = null;

			this.controlPoint = null;

		}
	}

	public onPointerUp ( e: PointerEventData ) {

		if ( this.markingDistanceChanged && this.node ) {

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

	private checkNodePointInteraction ( e: PointerEventData ): boolean {

		const maxDistance = Math.max( 0.5, e.approxCameraDistance * 0.01 );

		// first chceck for control point interactions
		// doing in 2 loop to prioritise control points
		const controlPoint = PickingHelper.checkControlPointInteraction( e, LaneRoadMarkNode.pointTag, maxDistance );

		if ( controlPoint ) {

			const node = controlPoint.parent as LaneRoadMarkNode;

			const roadMark = node.roadmark;

			CommandHistory.executeAll( [

				new SetValueCommand( this, 'controlPoint', controlPoint ),

				new SetValueCommand( this, 'node', node ),

				new SetInspectorCommand( LaneRoadmarkInspectorComponent, roadMark )

			] );

		} else if ( !this.controlPoint && this.controlPoint ) {

			CommandHistory.executeAll( [

				new SetValueCommand( this, 'controlPoint', null ),

				new SetValueCommand( this, 'node', null ),

				new SetInspectorCommand( null, null )

			] );

		}

		return controlPoint != null;

	}

	private checkLaneObjectInteraction ( e: PointerEventData ): boolean {

		const newLane = PickingHelper.checkLaneObjectInteraction( e );

		if ( this.lane && newLane == null ) {

			// clear

			const commands = [];

			commands.push( new ShowLaneMarkingCommand( null, this.lane, this.laneHelper ) );

			commands.push( new SetInspectorCommand( null, null ) );

			commands.push( new SetValueCommand( this, 'lane', null ) );

			CommandHistory.execute( new MultiCmdsCommand( commands ) );

		} else if ( this.lane && newLane && this.lane.gameObject.id !== newLane.gameObject.id && this.lane.roadId != newLane.roadId ) {

			// clear and select new

			const commands = [];

			commands.push( new ShowLaneMarkingCommand( newLane, this.lane, this.laneHelper ) );

			commands.push( new SetInspectorCommand( LaneInspectorComponent, newLane ) );

			commands.push( new SetValueCommand( this, 'lane', newLane ) );

			CommandHistory.execute( new MultiCmdsCommand( commands ) );

		} else if ( !this.lane && newLane ) {

			// select new

			const commands = [];

			commands.push( new SetValueCommand( this, 'lane', newLane ) );

			commands.push( new ShowLaneMarkingCommand( newLane, this.lane, this.laneHelper ) );

			commands.push( new SetInspectorCommand( LaneInspectorComponent, newLane ) );

			CommandHistory.execute( new MultiCmdsCommand( commands ) );

		} else if ( !this.lane && newLane == null ) {

			// clear

			CommandHistory.execute( new SetInspectorCommand( null, null ) );

		}

		return newLane != null;
	}

	private checkReferenceLineInteraction ( e: PointerEventData ) {

		const isShiftKeyDown = KeyboardInput.isShiftKeyDown;

		let hasInteracted = false;

		for ( let i = 0; i < e.intersections.length; i++ ) {

			const intersection = e.intersections[ i ];

			if ( e.button === MouseButton.LEFT && intersection.object && intersection.object[ 'tag' ] == this.laneHelper.tag ) {

				hasInteracted = true;

				if ( intersection.object.userData.lane ) {

					this.lane = intersection.object.userData.lane;

					if ( isShiftKeyDown ) {

						this.addRoadmarkNodeAt( e.point );

					} else {

						this.selectRoadMarkAt( e.point, this.lane );

					}

				}

				break;
			}
		}

		return hasInteracted;
	}

	private addRoadmarkNodeAt ( position: Vector3 ) {

		if ( !this.lane ) return;

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		TvMapQueries.getRoadByCoords( position.x, position.y, posTheta );

		// get the exisiting lane road mark at s and clone it
		const roadMark = this.lane.getRoadMarkAt( posTheta.s ).clone( posTheta.s );

		roadMark.node = NodeFactoryService.createRoadMarkNode( this.lane, roadMark );

		CommandHistory.executeAll( [

			new AddRoadmarkNodeCommand( this.lane, roadMark, this.roadMarkBuilder ),

			new SetValueCommand( this, 'roadMark', roadMark ),

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

	private rebuild ( roadId: number ) {

		// TODO may only road->lane need to be built

		const road = this.map.getRoadById( roadId );

		this.roadMarkBuilder.buildRoad( road );
	}

	private showNodes ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				lane.getRoadMarks().forEach( roadmark => {

					if ( roadmark.node ) {

						roadmark.node.visible = true;

					} else {

						roadmark.node = NodeFactoryService.createRoadMarkNode( lane, roadmark );

						SceneService.add( roadmark.node );

					}

				} );

			} );

		} );

	}

	private hideNodes ( road: TvRoad ) {

		road.laneSections.forEach( laneSection => {

			laneSection.lanes.forEach( lane => {

				lane.getRoadMarks().forEach( roadmark => {

					if ( roadmark.node ) roadmark.node.visible = false;

				} );

			} );

		} );

	}
}
