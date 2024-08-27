/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoad } from 'app/map/models/tv-road.model';
import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { RoadToolHelper } from './road-tool-helper.service';
import { RoadNode } from 'app/objects/road-node';
import { ControlPointStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { NodeStrategy } from 'app/core/strategies/select-strategies/node-strategy';
import { RoadControlPoint } from 'app/objects/road-control-point';
import { RoadTangentPoint } from 'app/objects/road-tangent-point';
import { Vector3 } from 'three';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Asset, AssetType } from 'app/core/asset/asset.model';
import { RoadStyle } from 'app/graphics/road-style/road-style.model';
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { ControlPointFactory } from "../../factories/control-point.factory";
import { Commands } from 'app/commands/commands';
import { AutoSpline } from 'app/core/shapes/auto-spline-v2';
import { PointOverlayHandler } from "../maneuver/point-overlay.handler";
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { SplineHandler } from "../../core/object-handlers/spline.handler";
import { SplineOverlayHandler } from "../../core/overlay-handlers/spline-overlay.handler";
import { SelectSplineStrategy } from "../../core/strategies/select-strategies/select-spline-strategy";
import { AppInspector } from 'app/core/inspector';
import { RoadInspector } from 'app/views/inspectors/road-inspector/road-inspector.component';
import { SplineFactory } from "../../services/spline/spline.factory";
import { Log } from 'app/core/utils/log';
import { RoadTangentPointHandler } from "../../core/object-handlers/road-tangent-point-handler";
import { RoadControlPointHandler } from "../../core/object-handlers/road-control-point-handler";
import { SplineControlPointHandler } from "../../core/object-handlers/spline-control-point-handler";

export class RoadTool extends BaseTool<AbstractSpline> {

	public name: string = 'Road Tool';

	public toolType: ToolType = ToolType.Road;

	private controlPointMoved: boolean;

	private selectedNode: RoadNode;

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

		} else {

			return this.objectHandlers.get( AutoSpline.name ).getSelected()[ 0 ] as AbstractSpline;

		}

	}

	constructor ( private tool: RoadToolHelper ) {

		super();

	}

	init (): void {

		this.tool.base.reset();

		this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( RoadNode.name, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );
		this.selectionService.registerStrategy( AutoSpline.name, new SelectSplineStrategy() );

		// we want all points to be selectable and use 1 point at a time
		this.tool.base.selection.registerTag( SplineControlPoint.name, SimpleControlPoint.name );
		this.tool.base.selection.registerTag( RoadControlPoint.name, SimpleControlPoint.name );
		this.tool.base.selection.registerTag( RoadTangentPoint.name, SimpleControlPoint.name );
		this.tool.base.selection.registerTag( AutoSpline.name, AutoSpline.name );
		this.tool.base.selection.registerTag( ExplicitSpline.name, AutoSpline.name );

		this.setDebugService( this.tool.toolDebugger );

		this.addHandlers();

		super.init();

	}

	addHandlers (): void {

		this.addObjectHandler( SplineControlPoint.name, this.tool.base.injector.get( SplineControlPointHandler ) );
		this.addObjectHandler( RoadControlPoint.name, this.tool.base.injector.get( RoadControlPointHandler ) );
		this.addObjectHandler( RoadTangentPoint.name, this.tool.base.injector.get( RoadTangentPointHandler ) );
		this.addObjectHandler( AutoSpline.name, this.tool.base.injector.get( SplineHandler ) );
		this.addObjectHandler( ExplicitSpline.name, this.tool.base.injector.get( SplineHandler ) );

		this.addOverlayHandler( SplineControlPoint.name, this.tool.base.injector.get( PointOverlayHandler ) );
		this.addOverlayHandler( RoadControlPoint.name, this.tool.base.injector.get( PointOverlayHandler ) );
		this.addOverlayHandler( RoadTangentPoint.name, this.tool.base.injector.get( PointOverlayHandler ) );
		this.addOverlayHandler( AutoSpline.name, this.tool.base.injector.get( SplineOverlayHandler ) );
		this.addOverlayHandler( ExplicitSpline.name, this.tool.base.injector.get( SplineOverlayHandler ) );

	}

	enable (): void {

		this.subscribeToEvents();

		// HACK: temp fix to prevent too many splines from being highlighted
		if ( this.tool.splineService.nonJunctionSplines.length > 100 ) {
			return;
		}

		this.tool.splineService.nonJunctionSplines.forEach( spline => {

			// this.debugService?.setDebugState( spline, DebugState.DEFAULT );

		} );

	}

	disable (): void {

		super.disable();

		this.tool.base.reset();

	}

	onAssetDropped ( asset: Asset, position: Vector3 ): void {

		if ( asset.type != AssetType.ROAD_STYLE ) return;

		const road = this.tool.roadService.findNearestRoad( position );

		if ( !road ) return;

		const roadStyle = this.tool.assetService.getInstance<RoadStyle>( asset.guid );

		if ( !roadStyle ) return;

		const oldValue = road.roadStyle.clone( null );

		const newValue = roadStyle.clone( null );

		Commands.SetValue( road, 'roadStyle', newValue, oldValue );

	}

	onPointerDownCreate ( e: PointerEventData ): void {

		if ( this.selectedSpline ) {

			const spline = this.selectedSpline || this.selectedRoad?.spline;

			const hasSuccessor = this.selectedRoad?.successor != null || false;

			const hasPredecessor = this.selectedRoad?.predecessor != null || false;

			this.createAndInsertPoint( e, spline, hasSuccessor, hasPredecessor );

		} else {

			this.createAndAddSpline( e.point );

		}

	}

	// eslint-disable-next-line max-lines-per-function
	createAndInsertPoint ( e: PointerEventData, spline: AbstractSpline, hasSuccessor: boolean, hasPredecessor: boolean ): void {

		if ( !spline ) return;

		const roadCoord = this.tool.roadService.findRoadCoord( e.point );

		const clickedSameRoad = roadCoord ? roadCoord.road.spline === spline : false;

		const clickedOtherRoad = roadCoord ? roadCoord.road.spline !== spline : false;

		if ( clickedOtherRoad && hasSuccessor ) {
			this.setHint( 'Cannot add a control point to a road with a successor' );
			return;
		}

		if ( !clickedSameRoad && hasSuccessor ) {
			this.setHint( 'Cannot add a control point to a road with a successor' );
			return;
		}

		let index = null;

		if ( clickedSameRoad ) {
			index = this.tool.splineService.findIndex( spline, e.point );
		}

		if ( index === 0 && hasSuccessor ) {
			this.setHint( 'Cannot add a control point to the start of a road' );
			return;
		}

		if ( index === 0 && hasPredecessor ) {
			this.setHint( 'Cannot add a control point to the start of a road with a predecessor' );
			return;
		}

		if ( index == spline.controlPoints.length - 1 && hasSuccessor && !clickedSameRoad ) {
			this.setHint( 'Cannot add a control point to the end of a road with a successor' );
			return;
		}

		const point = ControlPointFactory.createControl( spline, e.point, index );

		point.userData.insert = clickedSameRoad;

		this.executeAddAndSelect( point, this.currentPoint );

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService.handleSelection( e );

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.highlightWithHandlers( e );

		if ( !this.isPointerDown ) return;

		for ( const [ name, handler ] of this.getObjectHandlers() ) {

			const selected = handler.getSelected();

			if ( selected.length > 0 ) {

				this.tool.base.disableControls();

				selected.forEach( object => handler.onDrag( object, e ) );

				this.controlPointMoved = true;

				break;

			}

		}

	}

	onPointerUp ( e: PointerEventData ): void {

		this.tool.base.enableControls();

		if ( !this.controlPointMoved ) return;

		for ( const [ name, handler ] of this.getObjectHandlers() ) {

			const selected = handler.getSelected();

			if ( selected.length > 0 ) {

				selected.forEach( object => handler.onDragEnd( object, e ) );

				break;

			}

		}

		this.controlPointMoved = false;

	}

	onObjectAdded ( object: any ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleAction( object, 'onAdded' );

		} else {

			Log.error( 'Unknown object added', object.constructor.name );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleAction( object, 'onRemoved' );

		} else {

			Log.error( 'Unknown object removed', object.constructor.name );

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleAction( object, 'onUpdated' );

		} else {

			Log.error( 'Unknown object updated', object.constructor.name );

		}

	}

	onObjectSelected ( object: Object ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleSelectionWithHandlers( object );

		} else {

			Log.error( 'Unknown object selected', object.constructor.name );

		}

		this.showObjectInspector( object );


	}

	onObjectUnselected ( object: Object ): void {

		if ( this.hasHandlersFor( object ) ) {

			this.handleUnselectionWithHandlers( object );

		} else {

			Log.error( 'Unknown object unselected', object.constructor.name );

		}

		AppInspector.clear();

	}

	onDuplicateKeyDown (): void {

		if ( !this.selectedRoad ) return;

		this.tool.duplicateRoad( this.selectedRoad );

	}

	createAndAddSpline ( position: Vector3 ): void {

		const spline = SplineFactory.createAtPosition( position );

		Commands.AddSpline( spline );

	}

	onNodeSelected ( node: RoadNode ): void {

		if ( this.selectedNode ) {

			this.connectNodes( this.selectedNode, node );

			this.selectedNode = null;

		} else {

			this.selectedNode = node;

			node.select();

			this.setHint( 'Select another node to connect' );

		}

	}

	onNodeUnselected ( node: RoadNode ): void {

		node.unselect();

		// time hack to make sure the node is unselected
		// before we clear the selected node
		setTimeout( () => {

			this.selectedNode = null;

		}, 300 );

	}

	connectNodes ( nodeA: RoadNode, nodeB: RoadNode ): void {

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

	showObjectInspector ( object: object ): void {

		if ( object instanceof SplineControlPoint ) {

			AppInspector.setInspector( RoadInspector, { spline: object.spline, controlPoint: object } );

		} else if ( object instanceof RoadControlPoint ) {

			AppInspector.setInspector( RoadInspector, { spline: object.spline, controlPoint: object } );

		} else if ( object instanceof RoadTangentPoint ) {

			AppInspector.setInspector( RoadInspector, { spline: object.spline, controlPoint: object } );

		} else if ( object instanceof AutoSpline ) {

			AppInspector.setInspector( RoadInspector, { spline: object } );

		} else if ( object instanceof ExplicitSpline ) {

			AppInspector.setInspector( RoadInspector, { spline: object } );

		}

	}

}
