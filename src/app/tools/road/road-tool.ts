/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { PointerEventData } from 'app/events/pointer-event-data';
import { TvRoad } from 'app/map/models/tv-road.model';
import { ToolType } from '../tool-types.enum';
import { RoadToolHelper } from './road-tool-helper.service';
import { RoadNode } from 'app/objects/road/road-node';
import { PointSelectionStrategy } from 'app/core/strategies/select-strategies/control-point-strategy';
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { NodeStrategy } from 'app/core/strategies/select-strategies/node-strategy';
import { RoadControlPoint } from 'app/objects/road/road-control-point';
import { RoadTangentPoint } from 'app/objects/road/road-tangent-point';
import { Vector3 } from 'three';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { Asset, AssetType } from 'app/core/asset/asset.model';
import { RoadStyle } from 'app/graphics/road-style/road-style.model';
import { SimpleControlPoint } from "../../objects/simple-control-point";
import { ControlPointFactory } from "../../factories/control-point.factory";
import { Commands } from 'app/commands/commands';
import { AutoSpline } from 'app/core/shapes/auto-spline-v2';
import { PointVisualizer } from "../maneuver/point-visualizer";
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { AutoSplineController, ExplicitSplineController } from "../../core/controllers/spline.handler";
import { AutoSplineVisualizer, ExplicitSplineVisualizer } from "../../core/visualizers/spline-visualizer";
import { AutoSplineSelectionStrategy, ExplicitSplineSelectionStrategy } from "../../core/strategies/select-strategies/select-spline-strategy";
import { SplineFactory } from "../../services/spline/spline.factory";
import { RoadTangentPointController } from "../../core/controllers/road-tangent-point-controller";
import { RoadControlPointController } from "../../core/controllers/road-control-point-controller";
import { SplinePointController } from "../../core/controllers/spline-point-controller";
import { ToolWithHandler } from '../base-tool-v2';

export class RoadTool extends ToolWithHandler {

	public name: string = 'Road Tool';

	public toolType: ToolType = ToolType.Road;

	private selectedNode: RoadNode;

	get currentPoint (): SplineControlPoint | RoadControlPoint | SimpleControlPoint<AbstractSpline> {

		return this.selectionService.getLastSelected( SimpleControlPoint.name );

	}

	private get selectedRoad (): TvRoad {

		return this.selectionService.getLastSelected<TvRoad>( TvRoad.name );

	}

	// eslint-disable-next-line max-lines-per-function
	private get selectedSpline (): AbstractSpline {

		if ( this.selectionService.getLastSelected( AutoSpline.name ) ) {
			return this.selectionService.getLastSelected<AbstractSpline>( AutoSpline.name );
		}

		if ( this.selectionService.getLastSelected( ExplicitSpline.name ) ) {
			return this.selectionService.getLastSelected<AbstractSpline>( ExplicitSpline.name );
		}

		if ( this.currentPoint instanceof SimpleControlPoint ) {

			return this.currentPoint.mainObject;

		} else if ( this.currentPoint instanceof RoadControlPoint ) {

			return this.currentPoint.road.spline;

		} else if ( this.currentPoint instanceof SplineControlPoint ) {

			return this.currentPoint.spline;

		} else if ( this.selectedRoad ) {

			return this.selectedRoad.spline;

		} else {

			// if ( this.controllers.get( AutoSpline.name ).getSelected().length > 0 ) {
			// 	return this.controllers.get( AutoSpline.name ).getSelected()[ 0 ] as AbstractSpline;
			// }

			// if ( this.controllers.get( ExplicitSpline.name ).getSelected().length > 0 ) {
			// 	return this.controllers.get( ExplicitSpline.name ).getSelected()[ 0 ] as AbstractSpline;
			// }
		}

	}

	constructor ( private tool: RoadToolHelper ) {

		super();

	}

	init (): void {

		this.tool.base.reset();

		this.selectionService.registerStrategy( SimpleControlPoint.name, new PointSelectionStrategy() );
		this.selectionService.registerStrategy( RoadNode.name, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );
		this.selectionService.registerStrategy( AutoSpline.name, new AutoSplineSelectionStrategy() );
		this.selectionService.registerStrategy( ExplicitSpline.name, new ExplicitSplineSelectionStrategy() );

		// we want all points to be selectable and use 1 point at a time
		this.tool.base.selection.registerTag( SplineControlPoint.name, SimpleControlPoint.name );
		this.tool.base.selection.registerTag( RoadControlPoint.name, SimpleControlPoint.name );
		this.tool.base.selection.registerTag( RoadTangentPoint.name, SimpleControlPoint.name );
		this.tool.base.selection.registerTag( AutoSpline.name, AutoSpline.name );
		this.tool.base.selection.registerTag( ExplicitSpline.name, ExplicitSpline.name );

		this.setDebugService( this.tool.toolDebugger );

		this.addHandlers();

		super.init();

	}

	addHandlers (): void {

		this.addController( SplineControlPoint.name, this.tool.base.injector.get( SplinePointController ) );
		this.addController( RoadControlPoint.name, this.tool.base.injector.get( RoadControlPointController ) );
		this.addController( RoadTangentPoint.name, this.tool.base.injector.get( RoadTangentPointController ) );
		this.addController( AutoSpline.name, this.tool.base.injector.get( AutoSplineController ) );
		this.addController( ExplicitSpline.name, this.tool.base.injector.get( ExplicitSplineController ) );

		this.addVisualizer( SplineControlPoint.name, this.tool.base.injector.get( PointVisualizer ) );
		this.addVisualizer( RoadControlPoint.name, this.tool.base.injector.get( PointVisualizer ) );
		this.addVisualizer( RoadTangentPoint.name, this.tool.base.injector.get( PointVisualizer ) );
		this.addVisualizer( AutoSpline.name, this.tool.base.injector.get( AutoSplineVisualizer ) );
		this.addVisualizer( ExplicitSpline.name, this.tool.base.injector.get( ExplicitSplineVisualizer ) );

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

}
