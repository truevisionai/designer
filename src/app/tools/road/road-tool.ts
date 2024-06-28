/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoad } from 'app/map/models/tv-road.model';
import { CommandHistory } from 'app/services/command-history';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { AppInspector } from 'app/core/inspector';
import { RoadToolHelper } from './road-tool-helper.service';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { RoadNode } from 'app/objects/road-node';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { NodeStrategy } from 'app/core/strategies/select-strategies/node-strategy';
import { FreeMovingStrategy } from 'app/core/strategies/move-strategies/free-moving-strategy';
import { RoadControlPoint } from 'app/objects/road-control-point';
import { RoadTangentPoint } from 'app/objects/road-tangent-point';
import { Vector3 } from 'three';
import { Position } from 'app/scenario/models/position';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { OnRoadMovingStrategy } from "../../core/strategies/move-strategies/on-road-moving.strategy";
import { Asset, AssetType } from 'app/core/asset/asset.model';
import { RoadStyle } from 'app/graphics/road-style/road-style.model';
import { SetValueCommand } from 'app/commands/set-value-command';
import { DebugState } from '../../services/debug/debug-state';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';
import { UpdatePositionCommand } from "../../commands/update-position-command";
import { Environment } from "../../core/utils/environment";
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { ControlPointFactory } from "../../factories/control-point.factory";

export class RoadTool extends BaseTool<AbstractSpline> {

	public name: string = 'Road Tool';

	public toolType: ToolType = ToolType.Road;

	private controlPointMoved: boolean;

	private roadMoved: boolean;

	private pointPositionCache: Vector3[] = [];

	private debug = !Environment.production;

	private selectedNode: RoadNode;

	private isRoadDoubleClicked: boolean;

	private lastRoadClicked: TvRoad;

	get currentPoint (): SplineControlPoint | RoadControlPoint | SimpleControlPoint<AbstractSpline> {

		return this.selectionService.getLastSelected( SimpleControlPoint.name );

	}

	private get selectedRoad (): TvRoad {

		return this.selectionService.getLastSelected<TvRoad>( TvRoad.name );

	}

	private get selectedSpline (): AbstractSpline {

		if ( this.currentPoint instanceof SimpleControlPoint ) {

			return this.currentPoint.mainObject;

		} else if ( this.currentPoint instanceof RoadControlPoint ) {

			return this.currentPoint.road.spline;

		} else if ( this.currentPoint instanceof SplineControlPoint ) {

			return this.currentPoint.spline;

		} else if ( this.selectedRoad ) {

			return this.selectedRoad.spline;

		}

	}

	constructor ( private tool: RoadToolHelper ) {

		super();

	}

	init (): void {

		this.tool.base.reset();

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( RoadNode.name, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );
		this.selectionService.registerStrategy( TvRoad.name, new SelectRoadStrategy( false ) );

		// we want all points to be selectable and use 1 point at a time
		this.tool.base.selection.registerTag( SplineControlPoint.name, SimpleControlPoint.name );
		this.tool.base.selection.registerTag( RoadControlPoint.name, SimpleControlPoint.name );
		this.tool.base.selection.registerTag( RoadTangentPoint.name, SimpleControlPoint.name );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );
		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

		this.setDebugService( this.tool.toolDebugger );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

	}

	onAssetDropped ( asset: Asset, position: Vector3 ) {

		if ( asset.type != AssetType.ROAD_STYLE ) return;

		const road = this.tool.roadService.findNearestRoad( position );

		if ( !road ) return;

		const roadStyle = this.tool.assetService.getInstance<RoadStyle>( asset.guid );

		if ( !roadStyle ) return;

		const oldValue = road.roadStyle.clone( null );

		const newValue = roadStyle.clone( null );

		CommandHistory.execute( new SetValueCommand( road, 'roadStyle', newValue, oldValue ) );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( this.selectedSpline ) {

			this.createPoint( this.selectedSpline, this.selectedRoad, e );

		} else {

			this.createSpline( e.point );

		}

	}

	createPoint ( object: TvRoad | AbstractSpline, currentRoad: TvRoad, e: PointerEventData ) {

		const spline: AbstractSpline = object instanceof TvRoad ? object.spline : object;

		if ( !spline ) return;

		if ( currentRoad?.successor ) {
			this.setHint( 'Cannot add a control point to a road with a successor' );
			return;
		}

		const roadCoord = this.tool.roadService.findRoadCoord( e.point );

		let insert = false;

		if ( roadCoord && ( roadCoord.road.spline === spline || roadCoord.road.spline === currentRoad?.spline ) ) {
			insert = true;
		}

		const point = ControlPointFactory.createControl( spline, e.point );

		if ( insert ) point.userData.insert = insert;

		this.executeAddAndSelect( point, this.currentPoint );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				this.isRoadDoubleClicked = this.lastRoadClicked === object;

				this.lastRoadClicked = object;

				this.debugService.setDebugState( object.spline, DebugState.SELECTED );

			} else {

				this.isRoadDoubleClicked = false;

				this.lastRoadClicked = null;

			}

		}, () => {

			this.lastRoadClicked = null;

			this.isRoadDoubleClicked = false;

			if ( this.selectedSpline ) {

				this.debugService.updateDebugState( this.selectedSpline, DebugState.DEFAULT );

			}

		} );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.debugService.resetHighlighted();

		this.highlight( e );

		this.tool.base.handleMovement( e, ( position ) => {

			if ( position instanceof RoadPosition ) {
				this.debugService.setDebugState( position.road.spline, DebugState.HIGHLIGHTED );
			}

			if ( !this.isPointerDown ) return;

			if ( this.currentPoint && this.currentPoint.isSelected ) {

				this.handleControlPointMovement( this.currentPoint, position );

				this.controlPointMoved = true;

				this.tool.base.disableControls();

			} else if ( this.isRoadDoubleClicked ) {

				this.handleRoadMovement( position );

				this.roadMoved = true;

				this.tool.base.disableControls();

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

		// this.tool.splineService.update( this.selectedRoad.spline );

		this.roadMoved = true;
	}

	handleControlPointMovement ( point: AbstractControlPoint, position: Position ) {

		point.position.copy( position.position );

		// this.tool.updateSpline( spline );

		// this.tool.updateLinks( spline, point );

		// this.tool.showLinks( spline, point );

		this.controlPointMoved = true;

	}

	onPointerUp ( e: PointerEventData ): void {

		this.tool.base.enableControls();

		if ( this.controlPointMoved && this.currentPoint ) {

			const oldPosition = this.pointerDownAt.clone();

			const newPosition = this.currentPoint.position.clone();

			const updateCommand = new UpdatePositionCommand( this.currentPoint, newPosition, oldPosition );

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

			this.addRoad( object );

		} else if ( object instanceof AbstractSpline ) {

			this.addSpline( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.addPoint( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.removeRoad( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.removePoint( object );

		} else if ( object instanceof AbstractSpline ) {

			this.removeSpline( object );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.updateRoad( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.updatePoint( object );

		}

	}

	onObjectSelected ( object: Object ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeSelected( object );

		} else if ( object instanceof TvRoad ) {

			if ( this.selectedRoad ) this.onRoadUnselected( this.selectedRoad );

			this.onRoadSelected( object );

		} else if ( object instanceof AbstractSpline ) {

			if ( this.selectedSpline ) this.onObjectUnselected( this.selectedSpline );

			this.debugService.setDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onPointSelected( object );

		}

	}

	onObjectUnselected ( object: Object ): void {

		if ( object instanceof RoadNode ) {

			this.onNodeUnselected( object );

		} else if ( object instanceof TvRoad ) {

			this.onRoadUnselected( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onPointUnselected( object );

		} else if ( object instanceof AbstractSpline ) {

			this.debugService.setDebugState( object, DebugState.DEFAULT );

		}

	}

	onDuplicateKeyDown (): void {

		if ( !this.selectedRoad ) return;

		this.tool.duplicateRoad( this.selectedRoad );

	}

	// region point operations

	addPoint ( point: AbstractControlPoint ): void {

		const add = ( spline: AbstractSpline, point: AbstractControlPoint ) => {

			if ( point.userData.insert ) {

				this.tool.splineService.insertControlPoint( spline, point );

			} else {

				this.tool.splineService.addControlPoint( spline, point );

			}

			this.debugService?.updateDebugState( spline, DebugState.SELECTED );

			// AppInspector.setInspector( RoadInspector, { road: segment.getInstance<TvRoad>(), controlPoint } );

		}

		if ( point instanceof SplineControlPoint ) {

			add( point.spline, point )

		} else if ( point instanceof RoadControlPoint ) {

			add( point.road.spline, point );

		} else {

			console.error( 'Unknown control point type', point );
			return;

		}

	}

	updatePoint ( point: AbstractControlPoint ) {

		if ( point instanceof SplineControlPoint ) {

			this.updateSpline( point.spline );

			this.tool.updateLinks( point.spline, point );

		} else if ( point instanceof RoadControlPoint ) {

			point.updateTangents();

			this.updateSpline( point.road.spline );

		} else if ( point instanceof RoadTangentPoint ) {

			this.updateSpline( point.road.spline );

		} else {

			console.error( 'Unknown control point type', point );


		}

	}

	removePoint ( point: AbstractControlPoint ) {

		const remove = ( spline: AbstractSpline, point: AbstractControlPoint ) => {

			this.tool.splineService.removeControlPoint( spline, point );

			this.debugService?.updateDebugState( spline, DebugState.DEFAULT );

			// this.clearInspector();

		}

		if ( point instanceof SplineControlPoint ) {

			remove( point.spline, point );

		} else if ( point instanceof RoadControlPoint ) {

			remove( point.road.spline, point );

		} else {

			console.error( 'Unknown control point type', point );

		}

	}

	onPointSelected ( point: AbstractControlPoint ): void {

		point?.select();

		if ( point instanceof SplineControlPoint ) {

			this.debugService.setDebugState( point.spline, DebugState.SELECTED );

			const segment = point.spline.segmentMap.getFirst();

			if ( !segment ) return;

			if ( !( segment instanceof TvRoad ) ) return;

			AppInspector.setInspector( RoadInspector, { road: segment, controlPoint: point } );

		} else if ( point instanceof RoadControlPoint ) {

			this.debugService.setDebugState( point.road.spline, DebugState.SELECTED );

			AppInspector.setInspector( RoadInspector, { road: point.road, controlPoint: point } );

		} else {

			console.error( 'Unknown control point type', point );

		}

	}

	onPointUnselected ( point: AbstractControlPoint ): void {

		point?.unselect();

		AppInspector.clear();

	}

	// endregion

	// region road operations

	updateRoad ( road: TvRoad ) {

		this.tool.roadService.update( road );

		if ( road.spline.controlPoints.length < 2 ) return;

		this.debugService.setDebugState( road.spline, DebugState.SELECTED );

	}

	removeRoad ( road: TvRoad ) {

		this.tool.removeRoad( road );

	}

	addRoad ( road: TvRoad ): void {

		this.tool.roadService.add( road );

	}

	onRoadSelected ( road: TvRoad ): void {

		this.debugService.setDebugState( road.spline, DebugState.SELECTED );

		AppInspector.setInspector( RoadInspector, { road } );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.debugService.setDebugState( road.spline, DebugState.DEFAULT );

		AppInspector.clear();

	}

	// endregion

	// region spline operations

	createSpline ( position: Vector3 ) {

		const spline = this.tool.splineFactory.getNewSpline();

		const point = ControlPointFactory.createControl( spline, position );

		this.executeAddAndSelect( point, this.currentPoint );

	}

	updateSpline ( spline: AbstractSpline ) {

		this.tool.splineService.update( spline );

		this.debugService.updateDebugState( spline, DebugState.SELECTED );

		const successor = this.tool.splineService.getSuccessorSpline( spline );

		const predecessor = this.tool.splineService.getPredecessorSpline( spline );

		if ( successor ) this.debugService.updateDebugState( successor, DebugState.DEFAULT );

		if ( predecessor ) this.debugService.updateDebugState( predecessor, DebugState.DEFAULT );

	}

	addSpline ( spline: AbstractSpline ) {

		this.tool.splineService.add( spline );

		this.debugService.setDebugState( spline, DebugState.SELECTED );

	}

	removeSpline ( spline: AbstractSpline ) {

		this.tool.splineService.remove( spline );

		this.debugService.setDebugState( spline, DebugState.REMOVED );

	}

	// endregion

	onNodeSelected ( node: RoadNode ) {

		if ( this.selectedNode ) {

			this.connectNodes( this.selectedNode, node );

			this.selectedNode = null;

		} else {

			this.selectedNode = node;

			node.select();

			this.setHint( 'Select another node to connect' );

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

	connectNodes ( nodeA: RoadNode, nodeB: RoadNode ) {

		nodeA.unselect();

		nodeB.unselect();

		if ( nodeA === nodeB ) return;

		if ( nodeA.isConnected ) {

			this.setHint( 'Cannot connect a node which is already connected' );

			return;
		}

		if ( nodeB.isConnected ) {

			this.setHint( 'Cannot connect a node which is already connected' );

			return;
		}

		if ( nodeA.road === nodeB.road ) {

			this.setHint( 'Cannot connect a node to itself' );

			return;
		}

		const road = this.tool.createJoiningRoad( nodeA, nodeB );

		this.executeAddObject( road );

		this.setHint( 'Modify the new road or select another node to connect' );

	}

}
