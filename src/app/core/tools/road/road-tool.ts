/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { IToolWithPoint, SelectPointCommand } from 'app/core/commands/select-point-command';
import { RoadFactory } from 'app/core/factories/road-factory.service';
import { ControlPointStrategy, NodeStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { OnRoadStrategy } from 'app/core/snapping/select-strategies/on-road-strategy';
import { SelectStrategy } from 'app/core/snapping/select-strategies/select-strategy';
import { AddRoadPointCommand } from 'app/core/tools/road/add-road-point-command';
import { PointerEventData } from 'app/events/pointer-event-data';
import { CopyPositionCommand } from 'app/modules/three-js/commands/copy-position-command';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvRoadCoord } from 'app/modules/tv-map/models/tv-lane-coord';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { TvMapInstance } from 'app/modules/tv-map/services/tv-map-source-file';
import { CommandHistory } from 'app/services/command-history';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { ToolType } from '../../models/tool-types.enum';
import { BaseTool } from '../base-tool';
import { CreateControlPointCommand } from './create-control-point-command';
import { CreateRoadCommand } from './create-road-command';
import { JoinRoadNodeCommand } from './join-road-node-command';
import { RemoveRoadCommand } from './remove-road-command';
import { SelectRoadForRoadToolCommand } from './select-road-for-road-tool-command';
import { RoadManager } from "../../managers/road-manager";
import { JunctionManager } from 'app/core/managers/junction-manager';

export class RoadTool extends BaseTool implements IToolWithPoint {

	public name: string = 'RoadTool';
	public toolType = ToolType.Road;

	public road: TvRoad;
	public controlPoint: RoadControlPoint;
	public node: RoadNode;

	private roadChanged: boolean = false;

	private pointStrategy: SelectStrategy<RoadControlPoint>;
	private nodeStrategy: SelectStrategy<RoadNode>;
	private roadStrategy: SelectStrategy<TvRoadCoord>;

	constructor () {

		super();

		this.pointStrategy = new ControlPointStrategy<RoadControlPoint>();
		this.nodeStrategy = new NodeStrategy<RoadNode>( RoadNode.lineTag, true );
		this.roadStrategy = new OnRoadStrategy();


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
			.forEach( road => RoadManager.instance.showNodes( road ) );

	}

	disable () {

		super.disable();

		this.map.getRoads().forEach( road => road.hideHelpers() );

		this.road?.hideHelpers();

		this.controlPoint?.unselect();

		this.node?.unselect();

		// this.clearToolObjects();
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

		} else if ( this.road && this.road?.spline?.controlPoints.length >= 2 ) {

			const roadCoord = this.roadStrategy.onPointerDown( e );

			if ( !roadCoord ) {

				// new point is not on road so
				// add point in last
				CommandHistory.execute( new AddRoadPointCommand( this, this.road, e.point ) );

				this.setHint( 'Use SHIFT + LEFT CLICK to create road control points' );

			} else if ( roadCoord.road.id === this.road.id ) {

				// new point is on the same road so
				// add a point in the middle
				this.setHint( 'Cannot add control point to itself' );

			} else {

				// new point is on another road so
				// add a point in the middle and join the roads

				CommandHistory.execute( new AddRoadPointCommand( this, this.road, e.point ) );

				this.setHint( 'Use SHIFT + LEFT CLICK to create road control points' );

			}

			console.log( 'roadCoord', roadCoord );

			// CommandHistory.execute( new AddRoadPointCommand( this, this.controlPoint.road, e.point ) );

		} else if ( !this.road ) {

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

		const roadCoord = this.roadStrategy.onPointerDown( e );
		if ( roadCoord ) this.onRoadSelected( roadCoord.road );
		if ( roadCoord ) return;

		// if no object is selected we unselect road, node and control point
		CommandHistory.execute( new SelectRoadForRoadToolCommand( this, null ) );

	}

	onRoadSelected ( road: TvRoad ) {

		if ( !this.road || this.road.id !== road.id ) {

			CommandHistory.execute( new SelectRoadForRoadToolCommand( this, road ) );

			this.setHint( 'Use SHIFT + LEFT CLICK to create road control points' );

		}

	}

	onNodeSelected ( interactedNode: RoadNode ) {

		if ( this.node && this.node.getRoadId() !== interactedNode.getRoadId() ) {

			// node with node then

			// both nodes should be unconnected //
			if ( this.node.canConnect() && interactedNode.canConnect() ) {

				this.joinNodes( this.node, interactedNode );

				this.setHint( 'Modify road shape by dragging control points' );

			} else {

				this.setHint( 'Cannot join roads' );

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

			this.setHint( 'Select nodes to join roads' );

		} else {

			// this only selects the node
			CommandHistory.executeAll( [

				new SetInspectorCommand( RoadInspector, { road: interactedNode.road, node: interactedNode } ),

				new SetValueCommand( this, 'node', interactedNode ),

				new SetValueCommand( this, 'road', interactedNode.road ),

				new SetValueCommand( this, 'controlPoint', null ),

			] );

			this.setHint( 'Select another node to join roads' );

		}

		return true;

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

	onPointerMoved ( e: PointerEventData ) {

		if ( !this.pointStrategy.onPointerMoved( e ) ) this.nodeStrategy.onPointerMoved( e );

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

		this.setHint( 'Drag to move control point and change road shape' );

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

		} );

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
