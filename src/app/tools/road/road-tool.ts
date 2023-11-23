import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { AppInspector } from 'app/core/inspector';
import { RoadToolService } from './road-tool.service';
import { ControlPointFactory } from 'app/factories/control-point.factory';
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
import { MapEvents, RoadControlPointUpdatedEvent, RoadCreatedEvent, RoadRemovedEvent } from 'app/events/map-events';
import { RoadControlPoint } from 'app/modules/three-js/objects/road-control-point';
import { RoadTangentPoint } from 'app/modules/three-js/objects/road-tangent-point';

export class RoadTool extends BaseTool {

	name: string;

	toolType: ToolType = ToolType.Road;

	private roadChanged: boolean;

	private debug = true;

	private get selectedControlPoint (): AbstractControlPoint {

		return this.tool.selection.getLastSelected<any>( 'point' );

	}

	private get selectedNode (): RoadNode {

		return this.tool.selection.getLastSelected<RoadNode>( RoadNode.name );

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

		this.tool.selection.registerStrategy( 'point', new ControlPointStrategy() );

		this.tool.selection.registerStrategy( RoadNode.name, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );

		this.tool.selection.registerStrategy( TvRoad.name, new SelectRoadStrategy() );

		// we want all points to be selectable and use 1 point at a time
		this.tool.selection.registerTag( SplineControlPoint.name, 'point' );
		this.tool.selection.registerTag( RoadControlPoint.name, 'point' );
		this.tool.selection.registerTag( RoadTangentPoint.name, 'point' );

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

			if ( this.selectedRoad.successor ) {

				this.setHint( 'Cannot add a control point to a road with a successor' );

				return;

			}

			const point = ControlPointFactory.createControl( this.selectedRoad.spline, e.point );

			const addPointCommand = new AddObjectCommand( point );

			const selectPointCommand = new SelectObjectCommand( point );

			CommandHistory.executeMany( addPointCommand, selectPointCommand );

		} else {

			const road = this.tool.roadService.createDefaultRoad();

			const point = ControlPointFactory.createControl( road.spline, e.point );

			const addRoadCommand = new AddObjectCommand( road );

			const selectRoadCommand = new SelectObjectCommand( road );

			road.addControlPoint( point );

			CommandHistory.executeMany( addRoadCommand, selectRoadCommand );

		}

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.tool.selection.handleSelection( e );

	}

	onPointerMoved ( e: PointerEventData ): void {

		if ( !this.isPointerDown ) return;

		if ( !this.selectedControlPoint ) return;

		if ( !this.selectedControlPoint.isSelected ) return;

		this.tool.base.handleMovement( e, ( position ) => {

			this.selectedControlPoint.position.copy( position.position );

			this.selectedRoad.spline.update();

			this.tool.roadLinkService.updateLinks( this.selectedRoad, this.selectedControlPoint );

			this.tool.roadLinkService.showLinks( this.selectedRoad, this.selectedControlPoint );

			this.roadChanged = true;

		} );

	}

	onPointerUp ( e: PointerEventData ): void {

		if ( this.roadChanged && this.selectedControlPoint ) {

			const oldPosition = this.pointerDownAt.clone();

			const newPosition = this.selectedControlPoint.position.clone();

			const updateCommand = new UpdatePositionCommand( this.selectedControlPoint, newPosition, oldPosition );

			CommandHistory.execute( updateCommand );

			this.tool.roadLinkService.hideLinks( this.selectedRoad );

		}

		this.roadChanged = false;

	}

	onObjectAdded ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadAdded( object );

		} else if ( object instanceof SplineControlPoint ) {

			this.onControlPointAdded( object );

		} else {

			console.error( 'RoadTool.onObjectAdded: unknown object type: ' + object.constructor.name );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadRemoved( object );

		} else if ( object instanceof SplineControlPoint ) {

			this.onControlPointRemoved( object );

		} else {

			console.error( 'RoadTool.onObjectRemoved: unknown object type: ' + object.constructor.name );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( this.debug ) console.debug( 'RoadTool.onObjectUpdated', object );

		if ( object instanceof TvRoad ) {

			this.tool.roadService.rebuildRoad( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.selectedRoad.spline.update();

			this.tool.roadSplineService.rebuildSplineRoads( this.selectedRoad.spline );

			this.tool.roadService.rebuildLinks( this.selectedRoad, object );

			this.tool.roadService.updateRoadNodes( this.selectedRoad );

		} else {

			console.error( 'RoadTool.onObjectUpdated: unknown object type: ' + object.constructor.name );

		}

	}

	onRoadRemoved ( road: TvRoad ) {

		this.tool.mapService.map.removeRoad( road );

		this.tool.roadSplineService.removeRoadSegment( road );

		MapEvents.roadRemoved.emit( new RoadRemovedEvent( road ) );

	}

	onControlPointRemoved ( object: SplineControlPoint ) {

		SceneService.removeFromTool( object );

		this.selectedRoad.removeControlPoint( object );

		if ( this.selectedRoad.spline.controlPoints.length < 2 ) return;

		this.tool.roadSplineService.rebuildSplineRoads( this.selectedRoad.spline );

		this.tool.roadService.updateRoadNodes( this.selectedRoad );

	}

	onRoadAdded ( road: TvRoad ): void {

		this.tool.mapService.map.addRoad( road );

		this.tool.roadSplineService.addRoadSegment( road );

		this.tool.roadSplineService.rebuildSplineRoads( road.spline );

		MapEvents.roadCreated.emit( new RoadCreatedEvent( road ) );

	}

	onControlPointAdded ( controlPoint: SplineControlPoint ): void {

		SceneService.addToolObject( controlPoint );

		this.selectedRoad.addControlPoint( controlPoint );

		if ( this.selectedRoad.spline.controlPoints.length < 2 ) return;

		this.tool.roadSplineService.rebuildSplineRoads( this.selectedRoad.spline );

		this.tool.roadService.updateRoadNodes( this.selectedRoad );

	}

	onObjectSelected ( object: Object ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadSelected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointSelected( object );

		} else {

			console.error( 'RoadTool.onObjectSelected: unknown object type: ' + object.constructor.name );

		}

	}

	onObjectUnselected ( object: Object ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointUnselected( object );

		} else {

			console.error( 'RoadTool.onObjectUnselected: unknown object type: ' + object.constructor.name );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		console.log( this.selectedRoad, road );

		if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

		this.tool.showRoad( road );

		AppInspector.setInspector( RoadInspector, { road } );

		// this.tool.base.setHint( 'Click on the road to add a control point' );
	}

	onRoadUnselected ( road: TvRoad ): void {

		this.tool.hideRoad( road );

		AppInspector.clear();

	}

	onControlPointSelected ( controlPoint: AbstractControlPoint ): void {

		if ( this.selectedControlPoint ) this.onControlPointUnselected( this.selectedControlPoint );

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

		} else {

			node?.select();

			this.tool.base.setHint( 'Select another node to connect' );

		}

	}

	onNodeUnselected ( node: RoadNode ) {

		node?.unselect();

	}

	private connectNodes ( nodeA: RoadNode, nodeB: RoadNode ) {

		nodeA.unselect();

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
