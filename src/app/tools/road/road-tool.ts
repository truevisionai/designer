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
import { RoadToolService } from './road-tool.service';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { RoadNode } from 'app/objects/road-node';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { SelectRoadStrategy } from 'app/core/strategies/select-strategies/select-road-strategy';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { NodeStrategy } from 'app/core/strategies/select-strategies/node-strategy';
import { AddObjectCommand } from "../../commands/add-object-command";
import { SelectObjectCommand } from 'app/commands/select-object-command';
import { FreeMovingStrategy } from 'app/core/strategies/move-strategies/free-moving-strategy';
import { RoadControlPoint } from 'app/objects/road-control-point';
import { RoadTangentPoint } from 'app/objects/road-tangent-point';
import { Vector3 } from 'three';
import { Position } from 'app/scenario/models/position';
import { AbstractSpline, SplineType } from 'app/core/shapes/abstract-spline';
import { OnRoadMovingStrategy } from "../../core/strategies/move-strategies/on-road-moving.strategy";
import { Asset, AssetType } from 'app/core/asset/asset.model';
import { TvMapQueries } from 'app/map/queries/tv-map-queries';
import { RoadStyle } from 'app/graphics/road-style/road-style.model';
import { SetValueCommand } from 'app/commands/set-value-command';
import { DebugState } from '../../services/debug/debug-state';
import { RoadPosition } from 'app/scenario/models/positions/tv-road-position';
import { UpdatePositionCommand } from "../../commands/update-position-command";
import { Environment } from "../../core/utils/environment";

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

	private get selectedControlPoint (): SplineControlPoint {

		return this.selectionService.getLastSelected<any>( 'point' );

	}

	private get selectedRoad (): TvRoad {

		return this.selectionService.getLastSelected<TvRoad>( TvRoad.name );

	}

	private get selectedSpline (): AbstractSpline {

		return this.selectedControlPoint?.spline || this.selectedRoad?.spline;

	}

	constructor ( private tool: RoadToolService ) {

		super();

	}

	init (): void {

		this.tool.base.reset();

		this.selectionService.registerStrategy( 'point', new ControlPointStrategy() );
		this.selectionService.registerStrategy( RoadNode.name, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );
		this.selectionService.registerStrategy( TvRoad.name, new SelectRoadStrategy( false ) );

		// we want all points to be selectable and use 1 point at a time
		this.tool.base.selection.registerTag( SplineControlPoint.name, 'point' );
		this.tool.base.selection.registerTag( RoadControlPoint.name, 'point' );
		this.tool.base.selection.registerTag( RoadTangentPoint.name, 'point' );

		this.tool.base.addMovingStrategy( new OnRoadMovingStrategy() );
		this.tool.base.addMovingStrategy( new FreeMovingStrategy() );

	}

	enable (): void {

		super.enable();

	}

	disable (): void {

		super.disable();

		if ( this.selectedControlPoint ) this.onControlPointUnselected( this.selectedControlPoint );

		if ( this.selectedNode ) this.onNodeUnselected( this.selectedNode );

		this.tool.base.reset();

	}

	onAssetDropped ( asset: Asset, position: Vector3 ) {

		if ( asset.type != AssetType.ROAD_STYLE ) return;

		const road = TvMapQueries.getRoadByCoords( position.x, position.y );

		if ( !road ) return;

		const roadStyle = this.tool.assetService.getInstance<RoadStyle>( asset.guid );

		if ( !roadStyle ) return;

		const oldValue = road.roadStyle.clone( null );

		const newValue = roadStyle.clone( null );

		CommandHistory.execute( new SetValueCommand( road, 'roadStyle', newValue, oldValue ) );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( this.selectedSpline ) {

			this.handleAddingControlPoint( this.selectedSpline, this.selectedRoad, e );

		} else {

			this.createSpline( e.point );

		}

	}

	createSpline ( position: Vector3 ) {

		const spline = this.tool.splineFactory.getNewSpline();

		const point = this.tool.controlPointService.createSplineControlPoint( spline, position );

		spline.controlPoints.push( point );

		const addCommand = new AddObjectCommand( spline );

		const selectCommand = new SelectObjectCommand( point, this.selectedControlPoint );

		CommandHistory.executeMany( addCommand, selectCommand );

	}

	handleAddingControlPoint ( selectedSpline: AbstractSpline, selectedRoad: TvRoad, e: PointerEventData ) {

		const createPoint = ( spline: AbstractSpline, position: Vector3, oldPoint: AbstractControlPoint, insert: boolean = false ) => {

			const point = this.pointFactory.createSplineControlPoint( spline, position );

			if ( insert ) point.userData.insert = insert;

			const addPointCommand = new AddObjectCommand( point );

			const selectPointCommand = new SelectObjectCommand( point, oldPoint );

			CommandHistory.executeMany( addPointCommand, selectPointCommand );

		}

		this.tool.base.selection.handleCreation( e, ( object ) => {

			if ( object instanceof TvRoad ) {

				if ( object?.spline?.uuid === selectedSpline?.uuid ) {

					// add point on same road
					createPoint( selectedSpline, e.point, this.selectedControlPoint, true );

				} else {

					if ( selectedRoad?.successor ) {
						this.setHint( 'Cannot add a control point to a road with a successor' );
						return;
					}

					// add point on another road
					createPoint( selectedSpline, e.point, this.selectedControlPoint );

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

			if ( this.selectedSpline ) this.debugService.setDebugState( this.selectedSpline, DebugState.DEFAULT );

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

			this.onRoadAdded( object );

		} else if ( object instanceof AbstractSpline ) {

			this.tool.addSpline( object );

			this.debugService.setDebugState( object, DebugState.SELECTED );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointAdded( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadRemoved( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointRemoved( object );

		} else if ( object instanceof AbstractSpline ) {

			this.onSplineRemoved( object );

		}

	}

	onSplineRemoved ( spline: AbstractSpline ) {

		this.tool.removeSpline( spline );

		this.debugService.setDebugState( spline, DebugState.REMOVED );

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvRoad ) {

			this.onRoadUpdated( object );

		} else if ( object instanceof AbstractControlPoint ) {

			this.onControlPointUpdated( object );

		}

	}

	onSplineUpdated ( spline: AbstractSpline ) {

		this.tool.updateSpline( spline );

		if ( spline.type == SplineType.AUTOV2 ) {

			this.debugService.updateDebugState( spline, DebugState.SELECTED );

			this.debugService.updateDebugState( spline.getSuccessorSpline(), DebugState.DEFAULT );

			this.debugService.updateDebugState( spline.getPredecessorrSpline(), DebugState.DEFAULT );

		} else if ( spline.type == SplineType.EXPLICIT ) {

			this.debugService.updateDebugState( spline, DebugState.SELECTED );

			this.debugService.updateDebugState( spline.getSuccessorSpline(), DebugState.DEFAULT );

			this.debugService.updateDebugState( spline.getPredecessorrSpline(), DebugState.DEFAULT );

		}

	}

	onControlPointUpdated ( controlPoint: AbstractControlPoint ) {

		if ( controlPoint instanceof SplineControlPoint ) {

			this.onSplineUpdated( controlPoint.spline );

		} else if ( controlPoint instanceof RoadControlPoint ) {

			this.onSplineUpdated( controlPoint.road.spline );

		} else if ( controlPoint instanceof RoadTangentPoint ) {

			this.onSplineUpdated( controlPoint.road.spline );

		}

	}

	onRoadUpdated ( road: TvRoad ) {

		this.tool.roadService.update( road );

		if ( road.spline.controlPoints.length < 2 ) return;

		this.debugService.setDebugState( road.spline, DebugState.SELECTED );

	}

	onRoadRemoved ( road: TvRoad ) {

		this.tool.removeRoad( road );

	}

	onControlPointRemoved ( point: AbstractControlPoint ) {

		if ( point instanceof SplineControlPoint ) {

			point.parent.remove( point );

			this.tool.removeControlPoint( point.spline, point );

			this.onSplineUpdated( point.spline );

			AppInspector.clear();

		} else if ( point instanceof RoadControlPoint ) {

			point.parent.remove( point );

			this.tool.removeControlPoint( point.road.spline, point );

			this.onSplineUpdated( point.road.spline );

			AppInspector.clear();

		}

	}

	onRoadAdded ( road: TvRoad ): void {

		this.tool.roadService.add( road );

	}

	onControlPointAdded ( controlPoint: AbstractControlPoint ): void {

		if ( controlPoint instanceof SplineControlPoint ) {

			if ( controlPoint.userData.insert ) {

				this.tool.insertControlPoint( controlPoint.spline, controlPoint );

			} else {

				this.tool.addControlPoint( controlPoint.spline, controlPoint );

			}

			this.onSplineUpdated( controlPoint.spline );

		}

		if ( controlPoint instanceof RoadControlPoint ) {

			if ( controlPoint.userData.insert ) {

				this.tool.insertControlPoint( controlPoint.road.spline, controlPoint );

			} else {

				this.tool.addControlPoint( controlPoint.road.spline, controlPoint );

			}

			this.onSplineUpdated( controlPoint.road.spline );

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

		} else if ( object instanceof AbstractSpline ) {

			this.debugService.setDebugState( object, DebugState.DEFAULT );

		}

	}

	onRoadSelected ( road: TvRoad ): void {

		this.debugService.setDebugState( road.spline, DebugState.SELECTED );

		AppInspector.setInspector( RoadInspector, { road } );

	}

	onRoadUnselected ( road: TvRoad ): void {

		this.debugService.setDebugState( road.spline, DebugState.DEFAULT );

		AppInspector.clear();

	}

	onControlPointSelected ( controlPoint: AbstractControlPoint ): void {

		controlPoint?.select();

		if ( controlPoint instanceof SplineControlPoint ) {

			this.debugService.setDebugState( controlPoint.spline, DebugState.SELECTED );

			const segment = controlPoint.spline.getFirstRoadSegment();

			if ( !segment ) return;

			AppInspector.setInspector( RoadInspector, { road: segment.getInstance<TvRoad>(), controlPoint } );

		}

	}

	onControlPointUnselected ( controlPoint: AbstractControlPoint ): void {

		if ( controlPoint instanceof SplineControlPoint ) {

			controlPoint?.unselect();

			AppInspector.clear();

		}

	}

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

	onDuplicateKeyDown (): void {

		if ( !this.selectedRoad ) return;

		this.tool.duplicateRoad( this.selectedRoad );

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
