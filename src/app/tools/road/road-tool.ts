import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { AppInspector } from 'app/core/inspector';
import { RoadToolService } from './road-tool.service';
import { AbstractControlPoint } from 'app/modules/three-js/objects/abstract-control-point';
import { UpdatePositionCommand } from 'app/commands/copy-position-command';
import { RoadNode } from 'app/modules/three-js/objects/road-node';
import { ControlPointStrategy } from 'app/core/snapping/select-strategies/control-point-strategy';
import { SelectRoadStrategy } from 'app/core/snapping/select-strategies/select-road-strategy';
import { SplineControlPoint } from 'app/modules/three-js/objects/spline-control-point';
import { NodeStrategy } from 'app/core/snapping/select-strategies/node-strategy';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from 'app/commands/select-object-command';
import { SceneService } from 'app/services/scene.service';
import { FreeMovingStrategy } from 'app/core/snapping/move-strategies/free-moving-strategy';
import { MapEvents, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadTangentPoint } from 'app/modules/three-js/objects/road-tangent-point';
import { Vector3 } from 'three';
import { Position } from 'app/modules/scenario/models/position';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';

export class RoadTool extends BaseTool {

	public name: string = 'Road Tool';

	public toolType: ToolType = ToolType.Road;

	private controlPointMoved: boolean;

	private roadMoved: boolean;

	private pointPositionCache: Vector3[] = [];

	private debug = true;

	private selectedNode: RoadNode;

	private isRoadDoubleClicked: boolean;
	private lastRoadClicked: TvRoad;

	private get selectedControlPoint (): AbstractControlPoint {

		return this.tool.selection.getLastSelected<any>( 'point' );

	}

	private get selectedRoad (): TvRoad {

		return this.tool.selection.getLastSelected<TvRoad>( TvRoad.name );

	}

	constructor ( private tool: RoadToolService ) {

		super();

	}

	init (): void {

		this.tool.selection.reset();

		this.tool.base.reset();

		this.tool.base.selection.registerStrategy( 'point', new ControlPointStrategy() );
		this.tool.base.selection.registerStrategy( RoadNode.name, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );
		this.tool.base.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

		// we want all points to be selectable and use 1 point at a time
		this.tool.base.selection.registerTag( SplineControlPoint.name, 'point' );
		this.tool.base.selection.registerTag( RoadControlPoint.name, 'point' );
		this.tool.base.selection.registerTag( RoadTangentPoint.name, 'point' );

		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

	}

	enable (): void {

		super.enable();

		this.tool.roadService.showAllRoadNodes();

	}

	disable (): void {

		super.disable();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		if ( this.selectedControlPoint ) this.onControlPointUnselected( this.selectedControlPoint );

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		this.tool.roadService.hideAllRoadNodes();

		this.tool.selection.reset();

		this.tool.base.reset();
	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( this.selectedRoad ) {

			this.handleAddingControlPoint( this.selectedRoad, e );

		} else {

			const road = this.tool.roadService.createDefaultRoad();

			const point = this.tool.controlPointService.createSplineControlPoint( road.spline, e.point );

			const addRoadCommand = new AddObjectCommand( road );

			const selectRoadCommand = new SelectObjectCommand( road, this.selectedRoad );

			road.addControlPoint( point );

			CommandHistory.executeMany( addRoadCommand, selectRoadCommand );

		}

	}

	handleAddingControlPoint ( selectedRoad: TvRoad, e: PointerEventData ) {

		const createPoint = ( spline: AbstractSpline, position: Vector3, oldPoint: AbstractControlPoint, insert: boolean = false ) => {

			const point = this.tool.controlPointService.createSplineControlPoint( spline, position );

			if ( insert ) point.userData.insert = insert;

			const addPointCommand = new AddObjectCommand( point );

			const selectPointCommand = new SelectObjectCommand( point, oldPoint );

			CommandHistory.executeMany( addPointCommand, selectPointCommand );

		}

		this.tool.base.selection.handleCreation( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				if ( object.id === selectedRoad.id ) {

					// add point on same road
					createPoint( selectedRoad.spline, e.point, this.selectedControlPoint, true );

				} else {

					if ( selectedRoad.successor ) {
						this.setHint( 'Cannot add a control point to a road with a successor' );
						return;
					}

					// add point on another road
					createPoint( selectedRoad.spline, e.point, this.selectedControlPoint );

				}

			}

		}, () => {

			if ( selectedRoad.successor ) {
				this.setHint( 'Cannot add a control point to a road with a successor' );
				return;
			}

			createPoint( selectedRoad.spline, e.point, this.selectedControlPoint );

		} );
	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.base.selection.handleSelection( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				this.isRoadDoubleClicked = this.lastRoadClicked === object;

				this.lastRoadClicked = object;

			} else {

				this.isRoadDoubleClicked = false;

				this.lastRoadClicked = null;

			}

		}, () => {

			this.lastRoadClicked = null;

			this.isRoadDoubleClicked = false;

		} );

	}

	onPointerMoved ( e: PointerEventData ): void {

		if ( !this.isPointerDown ) return;

		console.log( this.selectedRoad, this.isRoadDoubleClicked );

		this.tool.base.handleMovement( e, ( position ) => {

			if ( this.selectedRoad && this.selectedControlPoint && this.selectedControlPoint.isSelected ) {

				this.handleControlPointMovement( this.selectedRoad, this.selectedControlPoint, position );

				this.controlPointMoved = true;

			} else if ( this.selectedRoad && this.isRoadDoubleClicked ) {

				this.handleRoadMovement( position );

				this.roadMoved = true;

			}

		} );

	}

	handleRoadMovement ( position: Position ) {

		const delta = position.position.clone().sub( this.pointerDownAt );

		if ( this.pointPositionCache.length === 0 ) {

			this.pointPositionCache = this.selectedRoad.spline.controlPoints.map( point => point.position.clone() );

		}

		this.selectedRoad.spline.controlPoints.forEach( ( point, index ) => {

			const newPosition = this.pointPositionCache[ index ].clone().add( delta );

			point.position.x = newPosition.x;

			point.position.y = newPosition.y;

		} );

		this.selectedRoad.spline.update();

		this.roadMoved = true;
	}

	handleControlPointMovement ( road: TvRoad, point: AbstractControlPoint, position: Position ) {

		point.position.copy( position.position );

		road.spline.update();

		this.tool.roadLinkService.updateLinks( road, point );

		this.tool.roadLinkService.showLinks( road, point );

		this.controlPointMoved = true;

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( this.controlPointMoved && this.selectedControlPoint ) {

			const oldPosition = this.pointerDownAt.clone();

			const newPosition = this.selectedControlPoint.position.clone();

			const updateCommand = new UpdatePositionCommand( this.selectedControlPoint, newPosition, oldPosition );

			CommandHistory.execute( updateCommand );

			this.tool.roadLinkService.hideLinks( this.selectedRoad );

		} else if ( this.roadMoved ) {

			const commands = [];

			this.selectedRoad.spline.controlPoints.forEach( ( point, index ) => {

				const oldPosition = this.pointPositionCache[ index ].clone();;

				const newPosition = point.position.clone();

				const updateCommand = new UpdatePositionCommand( point, newPosition, oldPosition );

				commands.push( updateCommand );

			} );

			CommandHistory.executeMany( ...commands );

			this.tool.roadLinkService.hideLinks( this.selectedRoad );

			this.pointPositionCache = [];

			this.roadMoved = false;

		}

		this.controlPointMoved = false;

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadAdded( object );

		} else if ( object instanceof SplineControlPoint ) {

			this.onControlPointAdded( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadRemoved( object );

		} else if ( object instanceof SplineControlPoint ) {

			this.onControlPointRemoved( object );

		}
	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.debug( 'RoadTool.onObjectUpdated', object );

		if ( object instanceof TvRoad ) {

			this.tool.roadService.rebuildRoad( object );

		} else if ( object instanceof SplineControlPoint ) {

			object.spline.update();

			this.tool.roadSplineService.rebuildSplineRoads( object.spline );

			this.tool.roadService.rebuildLinks( this.selectedRoad, object );

			if ( object.spline.controlPoints.length < 2 ) return;

			this.tool.roadService.updateRoadNodes( this.selectedRoad );

		}

	}

	onRoadRemoved ( road: TvRoad ) {

		this.tool.roadService.removeRoad( road, true );

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );

	}

	onControlPointRemoved ( controlPoint: SplineControlPoint ) {

		SceneService.removeFromTool( controlPoint );

		controlPoint.spline.removeControlPoint( controlPoint );

		if ( controlPoint.spline.controlPoints.length < 2 ) return;

		this.tool.roadSplineService.rebuildSplineRoads( controlPoint.spline );

		if ( this.selectedRoad ) this.tool.roadService.updateRoadNodes( this.selectedRoad );

	}

	onRoadAdded ( road: TvRoad ): void {

		this.tool.mapService.map.addRoad( road );

		this.tool.roadSplineService.addRoadSegment( road );

		this.tool.roadSplineService.rebuildSplineRoads( road.spline );

		MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) );

	}

	onControlPointAdded ( controlPoint: SplineControlPoint ): void {

		SceneService.addToolObject( controlPoint );

		if ( controlPoint.userData.insert ) {

			this.tool.insertPoint( controlPoint.spline, controlPoint );

		} else {

			this.tool.addPoint( controlPoint.spline, controlPoint );

		}

		if ( controlPoint.spline.controlPoints.length < 2 ) return;

		this.tool.roadSplineService.rebuildSplineRoads( controlPoint.spline );

		this.tool.roadService.updateRoadNodes( this.selectedRoad );

	}

	onObjectSelected ( object: Object ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointSelected( object );

		}

	}

	onObjectUnselected ( object: Object ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointUnselected( object );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		this.tool.showRoad( road );

		AppInspector.setInspector( RoadInspector, { road } );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.hideRoad( road );

		AppInspector.clear();

	}

	onControlPointSelected ( controlPoint: AbstractControlPoint ): void {

		controlPoint?.select();

		AppInspector.setInspector( RoadInspector, { road: this.selectedRoad, controlPoint } );

		// this.tool.base.setHint( 'Drag and move the control point to change the road' );
	}

	onControlPointUnselected ( controlPoint: AbstractControlPoint ): void {

		controlPoint?.unselect();

		AppInspector.clear();

	}

	onNodeSelected ( node: RoadNode ) {

		if ( this.selectedNode ) {

			this.connectNodes( this.selectedNode, node );

			this.selectedNode = null;

		} else {

			this.selectedNode = node;

			node.select();

			this.tool.base.setHint( 'Select another node to connect' );

		}

	}

	onNodeUnselected ( node: RoadNode ) {

		node.unselect();

		// time hack to make sure the node is unselected
		// before we clear the selected node
		setTimeout( () => {

			this.selectedNode = null;

		}, 300 );

	}

	onDuplicateKeyDown (): void {

		if ( !this.selectedRoad ) return;

		this.tool.roadService.duplicateRoad( this.selectedRoad );

	}

	private connectNodes ( nodeA: RoadNode, nodeB: RoadNode ) {

		nodeA.unselect();

		nodeB.unselect();

		if ( nodeA === nodeB ) return;

		if ( nodeA.isConnected ) {

			this.tool.base.setHint( 'Cannot connect a node which is already connected' );

			return;
		}

		if ( nodeB.isConnected ) {

			this.tool.base.setHint( 'Cannot connect a node which is already connected' );

			return;
		}

		if ( nodeA.road === nodeB.road ) {

			this.tool.base.setHint( 'Cannot connect a node to itself' );

			return;
		}

		const road = this.tool.roadService.createJoiningRoad( nodeA, nodeB );

		const addRoadCommand = new AddObjectCommand( road );

		const selectRoadCommand = new SelectObjectCommand( road );

		CommandHistory.executeMany( addRoadCommand, selectRoadCommand );

		this.tool.base.setHint( 'Modify the new road or select another node to connect' );

	}
}
