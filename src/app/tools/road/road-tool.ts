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
import {
	MapEvents
} from 'app/events/map-events';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadTangentPoint } from 'app/modules/three-js/objects/road-tangent-point';
import { Vector3 } from 'three';
import { Position } from 'app/modules/scenario/models/position';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { OnRoadMovingStrategy } from "../../core/snapping/move-strategies/on-road-moving.strategy";
import { RoadPosition } from "../../modules/scenario/models/positions/tv-road-position";
import { TvRoadCoord } from 'app/modules/tv-map/models/TvRoadCoord';
import { AutoSplineV2 } from 'app/core/shapes/auto-spline-v2';
import { RoadCreatedEvent } from "../../events/road/road-created-event";
import { RoadUpdatedEvent } from "../../events/road/road-updated-event";
import { RoadRemovedEvent } from "../../events/road/road-removed-event";
import { ControlPointCreatedEvent } from "../../events/control-point-created-event";
import { ControlPointUpdatedEvent } from "../../events/control-point-updated-event";
import { ControlPointRemovedEvent } from "../../events/control-point-removed-event";
import { SplineCreatedEvent } from "../../events/spline/spline-created-event";
import { SplineRemovedEvent } from "../../events/spline/spline-removed-event";
import { SplineUpdatedEvent } from 'app/events/spline/spline-updated-event';

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

	private get selectedControlPoint (): SplineControlPoint {

		return this.tool.selection.getLastSelected<any>( 'point' );

	}

	private get selectedRoad (): TvRoad {

		return this.tool.selection.getLastSelected<TvRoad>( TvRoad.name );

	}

	private get selectedSpline (): AbstractSpline {

		return this.selectedControlPoint?.spline;

	}

	constructor ( private tool: RoadToolService ) {

		super();

	}

	init (): void {

		this.tool.selection.reset();

		this.tool.base.reset();

		this.tool.base.selection.registerStrategy( 'point', new ControlPointStrategy() );
		this.tool.base.selection.registerStrategy( RoadNode.name, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );
		this.tool.base.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy( false ) );

		// we want all points to be selectable and use 1 point at a time
		this.tool.base.selection.registerTag( SplineControlPoint.name, 'point' );
		this.tool.base.selection.registerTag( RoadControlPoint.name, 'point' );
		this.tool.base.selection.registerTag( RoadTangentPoint.name, 'point' );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );
		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

	}

	enable (): void {

		super.enable();

		this.tool.onToolEnabled();

	}

	disable (): void {

		super.disable();

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		if ( this.selectedControlPoint ) this.onControlPointUnselected( this.selectedControlPoint );

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		this.tool.onToolDisabled();

		this.tool.selection.reset();

		this.tool.base.reset();
	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( this.selectedSpline ) {

			this.handleAddingControlPoint( this.selectedSpline, this.selectedRoad, e );

		} else {

			const spline = this.tool.roadSplineService.getNewSpline();

			const point = this.tool.controlPointService.createSplineControlPoint( spline, e.point );

			spline.controlPoints.push( point );

			const addCommand = new AddObjectCommand( spline );

			const selectCommand = new SelectObjectCommand( point, this.selectedControlPoint );

			CommandHistory.executeMany( addCommand, selectCommand );

			//const road = this.tool.createDefaultRoad();
			//
			//const point = this.tool.controlPointService.createSplineControlPoint( road.spline, e.point );
			//
			//const addRoadCommand = new AddObjectCommand( road );
			//
			//const selectRoadCommand = new SelectObjectCommand( road, this.selectedRoad );
			//
			//road.addControlPoint( point );
			//
			//CommandHistory.executeMany( addRoadCommand, selectRoadCommand );

		}

	}

	handleAddingControlPoint ( selectedSpline: AbstractSpline, selectedRoad: TvRoad, e: PointerEventData ) {

		const createPoint = ( spline: AbstractSpline, position: Vector3, oldPoint: AbstractControlPoint, insert: boolean = false ) => {

			const point = this.tool.controlPointService.createSplineControlPoint( spline, position );

			if ( insert ) point.userData.insert = insert;

			const addPointCommand = new AddObjectCommand( point );

			const selectPointCommand = new SelectObjectCommand( point, oldPoint );

			CommandHistory.executeMany( addPointCommand, selectPointCommand );

		}

		this.tool.base.selection.handleCreation( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				if ( object.id === selectedRoad?.id ) {

					// add point on same road
					createPoint( selectedRoad.spline, e.point, this.selectedControlPoint, true );

				} else {

					if ( selectedRoad?.successor ) {
						this.setHint( 'Cannot add a control point to a road with a successor' );
						return;
					}

					// add point on another road
					createPoint( selectedRoad.spline, e.point, this.selectedControlPoint );

				}

			}

		}, () => {

			if ( selectedRoad?.successor ) {
				this.setHint( 'Cannot add a control point to a road with a successor' );
				return;
			}

			createPoint( selectedSpline, e.point, this.selectedControlPoint );

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

		this.tool.removeHighlight();

		this.tool.base.handleMovement( e, ( position ) => {

			if ( position instanceof RoadPosition ) {
				this.tool.highlightSpline( position.road.spline );
			}

			if ( !this.isPointerDown ) return;

			if ( this.selectedControlPoint && this.selectedControlPoint.isSelected ) {

				this.handleControlPointMovement( this.selectedSpline, this.selectedControlPoint, position );

				this.controlPointMoved = true;

			} else if ( this.isRoadDoubleClicked ) {

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

	handleControlPointMovement ( spline: AbstractSpline, point: AbstractControlPoint, position: Position ) {

		point.position.copy( position.position );

		spline.update();

		this.tool.updateLinks( spline, point );

		this.tool.showLinks( spline, point );

		this.controlPointMoved = true;

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( this.controlPointMoved && this.selectedControlPoint ) {

			const oldPosition = this.pointerDownAt.clone();

			const newPosition = this.selectedControlPoint.position.clone();

			const updateCommand = new UpdatePositionCommand( this.selectedControlPoint, newPosition, oldPosition );

			CommandHistory.execute( updateCommand );

			if ( this.selectedRoad ) this.tool.hideLinks( this.selectedRoad );

		} else if ( this.roadMoved ) {

			const commands = [];

			this.selectedRoad.spline.controlPoints.forEach( ( point, index ) => {

				const oldPosition = this.pointPositionCache[ index ].clone();

				const newPosition = point.position.clone();

				const updateCommand = new UpdatePositionCommand( point, newPosition, oldPosition );

				commands.push( updateCommand );

			} );

			CommandHistory.executeMany( ...commands );

			if ( this.selectedRoad ) this.tool.hideLinks( this.selectedRoad );

			this.pointPositionCache = [];

			this.roadMoved = false;

		}

		this.controlPointMoved = false;

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoad ) {

			// this.onRoadAdded( object );

		} else if ( object instanceof AbstractSpline ) {

			this.tool.addSpline( object );

			MapEvents.splineCreated.emit( new SplineCreatedEvent( object ) );

		} else if ( object instanceof SplineControlPoint ) {

			this.onControlPointAdded( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadRemoved( object );

		} else if ( object instanceof SplineControlPoint ) {

			this.onControlPointRemoved( object );

		} else if ( object instanceof AbstractSpline ) {

			this.onSplineRemoved( object );

		}

	}

	onSplineRemoved ( spline: AbstractSpline ) {

		this.tool.removeSpline( spline );

		MapEvents.splineRemoved.emit( new SplineRemovedEvent( spline ) );

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadUpdated( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointUpdated( object );

		}

	}

	onSplineUpdated ( spline: AbstractSpline ) {

		MapEvents.splineUpdated.emit( new SplineUpdatedEvent( spline ) );

		this.tool.updateSplineVisuals( spline );

	}

	onControlPointUpdated ( controlPoint: AbstractControlPoint ) {

		if ( controlPoint instanceof SplineControlPoint ) {

			this.onSplineUpdated( controlPoint.spline );

		}

	}

	onRoadUpdated ( road: TvRoad ) {

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road, false ) );

		if ( road.spline.controlPoints.length < 2 ) return;

		this.tool.updateRoadNodes( road );

	}

	onRoadRemoved ( road: TvRoad ) {

		this.tool.removeRoad( road, true );

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );

	}

	onControlPointRemoved ( controlPoint: SplineControlPoint ) {

		SceneService.removeFromTool( controlPoint );

		controlPoint.spline.removeControlPoint( controlPoint );

		MapEvents.controlPointRemoved.emit( new ControlPointRemovedEvent( controlPoint, controlPoint.spline ) );

	}

	onRoadAdded ( road: TvRoad ): void {

		MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) );

	}

	onControlPointAdded ( controlPoint: SplineControlPoint ): void {

		if ( controlPoint.userData.insert ) {

			this.tool.insertPoint( controlPoint.spline, controlPoint );

		} else {

			this.tool.addPoint( controlPoint.spline, controlPoint );

		}

		MapEvents.controlPointCreated.emit( new ControlPointCreatedEvent( controlPoint ) );

	}

	onObjectSelected ( object: Object ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof AbstractSpline ) {

			this.tool.selectSpline( object );

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

		this.tool.selectSpline( road.spline );

		AppInspector.setInspector( RoadInspector, { road } );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.unselectSpline( road.spline );

		AppInspector.clear();

	}

	onControlPointSelected ( controlPoint: AbstractControlPoint ): void {

		controlPoint?.select();

		if ( controlPoint instanceof SplineControlPoint ) {

			this.tool.selectSpline( controlPoint.spline );

			const segment = controlPoint.spline.getFirstRoadSegment();

			if ( !segment ) return;

			AppInspector.setInspector( RoadInspector, { road: segment.getInstance<TvRoad>(), controlPoint } );

		}

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

		this.tool.duplicateRoad( this.selectedRoad );

	}

	connectNodes ( nodeA: RoadNode, nodeB: RoadNode ) {

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

		const road = this.tool.createJoiningRoad( nodeA, nodeB );

		const addRoadCommand = new AddObjectCommand( road );

		const selectRoadCommand = new SelectObjectCommand( road );

		CommandHistory.executeMany( addRoadCommand, selectRoadCommand );

		this.tool.base.setHint( 'Modify the new road or select another node to connect' );

	}

	connectRoads ( coordA: TvRoadCoord, coordB: TvRoadCoord ) {

	}
}
