/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AddRoadCommand } from 'app/core/commands/add-road-command';
import { AddRoadPointCommand } from 'app/core/commands/add-road-point-command';
import { MultiCmdsCommand } from 'app/core/commands/multi-cmds-command';
import { UpdateRoadPointCommand } from 'app/core/commands/update-road-point-command';
import { MouseButton, PointerEventData } from 'app/events/pointer-event-data';
import { SetValueCommand } from 'app/modules/three-js/commands/set-value-command';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { ObjectTypes, TvContactPoint } from 'app/modules/tv-map/models/tv-common';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { Intersection, Vector3 } from 'three';
import { JoinRoadNodeCommand } from '../commands/join-road-node-command';
import { SetInspectorCommand } from '../commands/set-inspector-command';
import { NodeFactoryService } from '../factories/node-factory.service';
import { RoadFactory } from '../factories/road-factory.service';
import { KeyboardInput } from '../input';
import { PickingHelper } from '../services/picking-helper.service';
import { BaseTool } from './base-tool';
import { AppInspector } from '../inspector';
import { CreateRoadCommand } from '../commands/create-road-command';

export class RoadTool extends BaseTool {

	public name: string = 'RoadTool';

	public road: TvRoad;
	public controlPoint: RoadControlPoint;
	public node: RoadNode;

	private roadChanged: boolean = false;

	constructor () {

		super();

	}

	init () {


	}

	enable () {

		super.enable();

		this.map.getRoads()
			.filter( road => !road.isJunction )
			.forEach( road => {
				road.updateRoadNodes();
				road.showNodes()
			} );

	}

	disable () {

		super.disable();

		this.map.getRoads().forEach( road => road.hideHelpers() );

		this.road?.hideHelpers();

		this.controlPoint?.unselect();

		this.node?.unselected();
	}

	onPointerDown ( e: PointerEventData ) {

		if ( e.button == MouseButton.RIGHT || e.button == MouseButton.MIDDLE ) return;

		const shiftKeyDown = KeyboardInput.isShiftKeyDown;

		if ( !shiftKeyDown && this.isControlPointSelected( e ) ) return;

		if ( !shiftKeyDown && this.isRoadNodeSelected( e ) ) return;

		if ( !shiftKeyDown && this.isLaneSelected( e ) ) return;

		if ( shiftKeyDown && e.point != null ) {

			this.addControlPoint( e.point );

		} else {

			this.resetRoadControlPointAndNode();

		}
	}

	onPointerClicked ( e: PointerEventData ) {

		// NOTE: no need to do chck creation logic here, as it caused bugs, moved it in onPointerDown

	}

	onPointerUp ( e: PointerEventData ) {

		if ( this.roadChanged && this.road && this.road.spline.controlPoints.length >= 2 ) {

			const updateRoadPointCommand = new UpdateRoadPointCommand(
				this.road, this.controlPoint, this.controlPoint.position, this.pointerDownAt
			);

			CommandHistory.execute( updateRoadPointCommand );

		}

		this.roadChanged = false;
	}

	onPointerMoved ( e: PointerEventData ) {

		if ( this.isPointerDown && this.controlPoint && this.controlPoint.isSelected && this.road ) {

			this.controlPoint.copyPosition( e.point );

			this.road.spline.update();

			this.roadChanged = true;

			this.updateSuccessor( this.road, this.controlPoint );

			this.updatePredecessor( this.road, this.controlPoint );
		}

	}

	private updateSuccessor ( road: TvRoad, currentPoint: RoadControlPoint ) {

		const P1 = road.spline.getSecondLastPoint() as RoadControlPoint;
		const P2 = road.spline.getLastPoint() as RoadControlPoint;

		if ( road.successor && road.successor.elementType !== 'junction'
			&& ( P1.id === currentPoint.id || P2.id === currentPoint.id ) ) {

			const successor = this.map.getRoadById( road.successor.elementId );

			if ( !successor ) return;

			successor.spline.show();

			let P3: RoadControlPoint;

			let P4: RoadControlPoint;

			let newP4: RoadControlPoint;

			let distance: number;

			if ( road.successor.contactPoint === TvContactPoint.START ) {

				P3 = successor.spline.controlPoints[ 0 ] as RoadControlPoint;

				P4 = successor.spline.controlPoints[ 1 ] as RoadControlPoint;

				distance = P3.position.distanceTo( P4.position );

				P3.copyPosition( P2.position );

				P2.hdg = P3.hdg = P1.hdg;

				newP4 = P2.moveForward( distance );

				P4.copyPosition( newP4.position );

				successor.spline.update();

			} else {

				P3 = successor.spline.getLastPoint() as RoadControlPoint;

				P4 = successor.spline.getSecondLastPoint() as RoadControlPoint;

				distance = P3.position.distanceTo( P4.position );

				P3.copyPosition( P2.position );

				P2.hdg = P1.hdg;

				P3.hdg = P2.hdg + Math.PI;

				newP4 = P2.moveForward( distance );

				P4.copyPosition( newP4.position );

				successor.spline.update();
			}
		}
	}

	private updatePredecessor ( road: TvRoad, currentPoint: RoadControlPoint ) {

		const P1 = road.spline.controlPoints[ 1 ] as RoadControlPoint;
		const P2 = road.spline.controlPoints[ 0 ] as RoadControlPoint;

		if ( road.predecessor && road.predecessor.elementType !== 'junction'
			&& ( P1.id === currentPoint.id || P2.id === currentPoint.id ) ) {

			const predecessor = this.map.getRoadById( road.predecessor.elementId );

			if ( !predecessor ) return;

			predecessor.spline.show();

			let P3: RoadControlPoint;

			let P4: RoadControlPoint;

			let newP4: RoadControlPoint;

			let distance: number;

			if ( road.predecessor.contactPoint === TvContactPoint.START ) {

				P3 = predecessor.spline.controlPoints[ 0 ] as RoadControlPoint;

				P4 = predecessor.spline.controlPoints[ 1 ] as RoadControlPoint;

				distance = P3.position.distanceTo( P4.position );

				P3.copyPosition( P2.position );

				P3.hdg = P4.hdg = P2.hdg + Math.PI;

				newP4 = P3.moveForward( distance );

				P4.copyPosition( newP4.position );

				predecessor.spline.update();

			} else {

				P3 = predecessor.spline.getLastPoint() as RoadControlPoint;

				P4 = predecessor.spline.getSecondLastPoint() as RoadControlPoint;

				distance = P3.position.distanceTo( P4.position );

				P3.copyPosition( P2.position );

				P3.hdg = P4.hdg = P2.hdg + Math.PI;

				newP4 = P3.moveForward( distance );

				P4.copyPosition( newP4.position );

				predecessor.spline.update();

			}
		}
	}

	private resetRoadControlPointAndNode () {

		const commands = [];

		if ( this.road )
			commands.push( new SetValueCommand( this, 'road', null ) );

		if ( this.controlPoint )
			commands.push( new SetValueCommand( this, 'controlPoint', null ) );

		if ( this.node )
			commands.push( new SetValueCommand( this, 'node', null ) );

		if ( AppInspector.currentInspector )
			commands.push( new SetInspectorCommand( null, null ) );

		if ( commands.length > 0 )
			CommandHistory.execute( new MultiCmdsCommand( commands ) );

	}

	private isControlPointSelected ( e: PointerEventData ): boolean {

		if ( !this.road || !this.road.spline || !e.point ) return false;

		const nearestControlPoint = this.findNearestControlPoint( e, e.point );

		if ( nearestControlPoint && nearestControlPoint !== this.controlPoint ) {

			this.selectControlPoint( nearestControlPoint );

		} else if ( !nearestControlPoint && this.controlPoint ) {

			this.deselectControlPoint();

		}

		return !!nearestControlPoint;
	}

	private selectControlPoint ( controlPoint: RoadControlPoint ): void {

		CommandHistory.executeAll( [
			new SetInspectorCommand( RoadInspector, { road: this.road, controlPoint } ),
			new SetValueCommand( this, 'controlPoint', controlPoint ),
			new SetValueCommand( this, 'node', null )
		] );

	}

	private deselectControlPoint (): void {

		CommandHistory.executeAll( [
			new SetValueCommand( this, 'controlPoint', null ),
			new SetInspectorCommand( null, null )
		] );

	}

	private isLaneSelected ( e: PointerEventData ): boolean {

		let hasInteracted = false;

		const laneIntersection = this.findLaneIntersection( e.intersections );

		if ( laneIntersection ) {

			hasInteracted = true;

			const lane = laneIntersection.object.userData.lane as TvLane;
			const road = this.map.getRoadById( lane.roadId );

			if ( !road.isJunction ) this.selectRoad( road );
		}

		return hasInteracted;
	}

	private findLaneIntersection ( intersections: Intersection[] ): Intersection | null {

		for ( const intersection of intersections ) {

			if ( intersection.object && intersection.object[ 'tag' ] === ObjectTypes.LANE ) {

				return intersection;

			}

		}

		return null;
	}

	private selectRoad ( road: TvRoad ): void {

		const commands = [];

		if ( !this.road || this.road.id !== road.id ) {
			commands.push( new SetValueCommand( this, 'road', road ) );
			commands.push( new SetInspectorCommand( RoadInspector, { road } ) );
		}

		if ( this.controlPoint ) {
			commands.push( new SetValueCommand( this, 'controlPoint', null ) );
		}

		if ( this.node ) {
			commands.push( new SetValueCommand( this, 'node', null ) );
		}

		if ( commands.length > 0 ) {
			CommandHistory.executeAll( commands );
		}
	}

	private isRoadNodeSelected ( e: PointerEventData ): boolean {

		const interactedNode = this.findRoadNodeFromIntersections( e.intersections );

		if ( interactedNode ) {

			if ( this.node && this.node.getRoadId() !== interactedNode.getRoadId() ) {

				// node with node then

				// two roads need to joined
				// we take both nodes and use them as start and end points
				// for a new road
				// new road will have 4 more points, so total 6 points

				this.joinNodes( this.node, interactedNode );

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
				this.selectRoadNode( interactedNode.road, interactedNode );

			}

		} else if ( this.node ) {

			this.deselectNode();

		}

		return !!interactedNode;
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

	private selectRoadNode ( road: TvRoad, node: RoadNode ): void {

		CommandHistory.executeAll( [

			new SetInspectorCommand( RoadInspector, { road, node } ),

			new SetValueCommand( this, 'node', node ),

			new SetValueCommand( this, 'road', road ),

			new SetValueCommand( this, 'controlPoint', null ),

		] );
	}

	private deselectNode (): void {

		this.node.unselected();

		this.node = null;

	}


	private addControlPoint ( position: Vector3 ) {

		if ( !this.road ) {

			CommandHistory.execute( new CreateRoadCommand( this, position ) );

		} else {


			CommandHistory.execute( new AddRoadPointCommand( this, this.road, position ) );

		}
	}

	private joinNodes ( firstNode: RoadNode, secondNode: RoadNode ) {

		const commands = [];

		commands.push( new SetValueCommand( this, 'node', null ) );

		commands.push( new SetValueCommand( this, 'road', null ) );

		commands.push( new SetValueCommand( this, 'controlPoint', null ) );

		commands.push( new JoinRoadNodeCommand( firstNode, secondNode ) );

		CommandHistory.execute( new MultiCmdsCommand( commands ) );

	}
}
