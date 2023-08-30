/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AddRoadPointCommand } from 'app/core/tools/road/add-road-point-command';
import { UpdateRoadPointCommand } from 'app/core/commands/update-road-point-command';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { ObjectTypes } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { Intersection, Vector3 } from 'three';
import { CreateRoadCommand } from './create-road-command';
import { JoinRoadNodeCommand } from './join-road-node-command';
import { SelectRoadForRoadToolCommand } from './select-road-for-road-tool-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { KeyboardInput } from '../../input';
import { ToolType } from '../../models/tool-types.enum';
import { PickingHelper } from '../../services/picking-helper.service';
import { BaseTool } from '../base-tool';
import { RemoveRoadCommand } from './remove-road-command';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { CopyPositionCommand } from 'app/modules/three-js/commands/copy-position-command';
import { IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { TvConsole } from 'app/core/utils/console';
import { SceneService } from 'app/core/services/scene.service';
import { CreateControlPointCommand } from './create-control-point-command';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { ControlPointStrategy, NodeStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { ObjectTagStrategy } from 'app/core/snapping/select-strategies/object-tag-strategy';

export class RoadTool extends BaseTool implements IToolWithPoint {

	public name: string = 'RoadTool';
	public toolType = ToolType.Road;

	public road: TvRoad;
	public controlPoint: RoadControlPoint;
	public node: RoadNode;

	private roadChanged: boolean = false;

	private pointStrategy: SelectStrategy<RoadControlPoint>;
	private nodeStrategy: SelectStrategy<RoadNode>;
	private roadStrategy: SelectStrategy<TvRoad>;

	constructor () {

		super();

		this.pointStrategy = new ControlPointStrategy<RoadControlPoint>();
		this.nodeStrategy = new NodeStrategy<RoadNode>( RoadNode.lineTag, true );


	}

	setPoint ( value: RoadControlPoint ): void {

		this.controlPoint = value;

	}

	getPoint (): RoadControlPoint {

		return this.controlPoint;

	}

	init () {

		this.setHint( 'Use SHIFT + LEFT CLICK to create road control points' );

	}

	enable () {

		super.enable();

		this.map.getRoads()
			.filter( road => !road.isJunction )
			.forEach( road => {
				road.updateRoadNodes();
				road.showNodes();
			} );

	}

	disable () {

		super.disable();

		this.map.getRoads().forEach( road => road.hideHelpers() );

		this.road?.hideHelpers();

		this.controlPoint?.unselect();

		this.node?.unselect();
	}

	removeRoad ( road: TvRoad ) {

		CommandHistory.executeMany(

			new RemoveRoadCommand( road ),

			new SetInspectorCommand( null, null )

		);

	}

	onPointerDownCreate ( e: PointerEventData ) {

		if ( this.controlPoint && this.controlPoint?.road?.spline?.controlPoints.length == 1 ) {

			CommandHistory.execute( new CreateRoadCommand( this, this.controlPoint.road, e.point ) );

		} else if ( this.controlPoint && this.controlPoint?.road?.spline?.controlPoints.length >= 2 ) {

			CommandHistory.execute( new AddRoadPointCommand( this, this.controlPoint.road, e.point ) );

		} else {

			CommandHistory.execute( new CreateControlPointCommand( this, e.point ) );

		}

	}

	onPointerDownSelect ( e: PointerEventData ) {

		const point = this.pointStrategy.onPointerDown( e );
		if ( point ) this.onControlPointSelected( point );
		if ( point ) return;

		const node = this.nodeStrategy.onPointerDown( e );
		if ( node ) this.onNodeSelected( node );
		if ( node ) return;

		// select road, unselect point and node
		if ( this.isRoadSelected( e ) ) return;

		// if no object is selected we unselect road, node and control point
		CommandHistory.execute( new SelectRoadForRoadToolCommand( this, null ) );

	}

	onNodeSelected ( interactedNode: RoadNode ) {

		if ( this.node && this.node.getRoadId() !== interactedNode.getRoadId() ) {

			// node with node then

			// two roads need to joined
			// we take both nodes and use them as start and end points
			// for a new road
			// new road will have 4 more points, so total 6 points

			// both nodes should be unconnected //
			if ( this.node.canConnect() && interactedNode.canConnect() ) {
				this.joinNodes( this.node, interactedNode );
			}

		} else if ( this.controlPoint ) {

			// control point with node
			// modify the control point road and join it the the node road
			// console.log( "only join roads", this.road.id, node.roadId );

			// another scenario of first node selected then controlpoint
			// in this
			// create new road and normally but with node as the first point
			// and second point will be forward distance of x distance
			// then 3rd point will be created wherever the point was selected

		} else {

			// this only selects the node
			CommandHistory.executeAll( [

				new SetInspectorCommand( RoadInspector, { road: interactedNode.road, node: interactedNode } ),

				new SetValueCommand( this, 'node', interactedNode ),

				new SetValueCommand( this, 'road', interactedNode.road ),

				new SetValueCommand( this, 'controlPoint', null ),

			] );

		}

		return true;

	}

	onPointerClicked ( e: PointerEventData ) {

		// NOTE: no need to do chck creation logic here, as it caused bugs, moved it in onPointerDown

	}

	onPointerUp ( e: PointerEventData ) {

		if ( this.roadChanged && this.road && this.road.spline.controlPoints.length >= 2 ) {

			const oldPosition = this.pointerDownAt.clone();

			const newPosition = this.controlPoint.position.clone();

			const command = new CopyPositionCommand( this.controlPoint, newPosition, oldPosition );

			CommandHistory.execute( command );

			this.road?.successor?.hideSpline();

			this.road?.predecessor?.hideSpline();

		}

		this.roadChanged = false;
	}

	private tempNode: RoadNode;

	onPointerMoved ( e: PointerEventData ) {

		this.pointStrategy.onPointerMoved( e );

		console.log( this.nodeStrategy.onPointerMoved( e ) );

		// if ( this.tempNode && !this.tempNode.isSelected ) this.tempNode?.onMouseOut();
		// this.tempNode = this.nodeStrategy.onPointerMoved( e )?.parent as RoadNode;
		// if ( this.tempNode && !this.tempNode.isSelected ) this.tempNode.onMouseOver();

		if ( this.isPointerDown && this.controlPoint && this.controlPoint.isSelected && this.road ) {

			this.controlPoint.position.copy( e.point );

			this.road.spline.update();

			this.controlPoint.updateSuccessor( false );

			this.controlPoint.updatePredecessor( false );

			this.roadChanged = true;

		}

	}

	private onControlPointSelected ( controlPoint: RoadControlPoint ): void {

		CommandHistory.executeAll( [
			new SelectPointCommand( this, controlPoint, RoadInspector, {
				road: controlPoint.road,
				controlPoint: controlPoint
			} ),
			new SetValueCommand( this, 'node', null )
		] );

	}

	private isRoadSelected ( e: PointerEventData ): boolean {

		const laneObject = this.findIntersection( ObjectTypes.LANE, e.intersections );

		if ( !laneObject || !laneObject.userData.lane ) return false;

		const lane = laneObject.userData.lane as TvLane;

		if ( !lane || !lane.laneSection.road ) return false;

		// if ( lane.laneSection.road.isJunction ) {
		// 	// we return true because we had interacted with
		// 	// road junction but there is not action for it right now
		// 	return true;
		// }

		if ( !this.road || this.road.id !== lane.laneSection.road.id ) {

			CommandHistory.execute( new SelectRoadForRoadToolCommand( this, lane.laneSection.road ) );

		}

		return true;
	}

	private findNearestControlPoint ( e: PointerEventData, point: Vector3 ): RoadControlPoint | null {

		const maxDistance = Math.max( 0.5, Math.exp( 0.001 * e.approxCameraDistance ) );

		const controlPoints = [];

		this.road.spline.controlPoints.forEach( ( cp: RoadControlPoint ) => {

			controlPoints.push( cp );

			if ( cp.frontTangent ) controlPoints.push( cp.frontTangent );

			if ( cp.backTangent ) controlPoints.push( cp.backTangent );

		} );

		return PickingHelper.findNearestViaDistance( point, controlPoints, maxDistance );
	}

	private findRoadNodeFromIntersections ( intersections: Intersection[] ): RoadNode | null {

		for ( let i = 0; i < intersections.length; i++ ) {

			const intersection = intersections[ i ];

			if ( intersection.object && intersection.object[ 'tag' ] === RoadNode.lineTag ) {
				return intersection.object.parent as RoadNode;
			}
		}

		return null;
	}

	private joinNodes ( firstNode: RoadNode, secondNode: RoadNode ) {

		CommandHistory.execute( new JoinRoadNodeCommand( this, firstNode, secondNode ) );

	}
}


class RoadConnectionsUpdate {

	static update ( road: TvRoad ) {

		if ( road.isJunction ) {

			this.updateJunctionRoad( road );

		} else {

			this.updateRoad( road );

		}

	}


	static updateRoad ( road: TvRoad ) {

		const firstPoint = road.spline.getFirstPoint() as RoadControlPoint;

		const lastPoint = road.spline.getLastPoint() as RoadControlPoint;

		const map = TvMapInstance.map;

		const successors = map.getRoads().filter( r => r.predecessor?.elementId === road.id );

		const predecessors = map.getRoads().filter( r => r.successor?.elementId === road.id );

		successors.forEach( successor => {

			const successorFirstPoint = successor.spline.getFirstPoint() as RoadControlPoint;

			successorFirstPoint.copyPosition( lastPoint.position );

			successor.spline.update();

			successor.updateGeometryFromSpline();

			RoadFactory.rebuildRoad( successor );

		} )

		predecessors.forEach( predecessor => {

			const predecessorLastPoint = predecessor.spline.getLastPoint() as RoadControlPoint;

			predecessorLastPoint.copyPosition( firstPoint.position );

			predecessor.spline.update();

			predecessor.updateGeometryFromSpline();

			RoadFactory.rebuildRoad( predecessor );

		} );

	}

	static updateJunctionRoad ( road: TvRoad ) {

		console.error( 'updateJunctionRoad not implemented' );

	}

}
