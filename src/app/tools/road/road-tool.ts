/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/map/models/tv-road.model';
import { ToolType } from '../tool-types.enum';
import { RoadToolHelper } from './road-tool-helper.service';
import { RoadNode } from 'app/objects/road/road-node';
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { NodeStrategy } from 'app/core/strategies/select-strategies/node-strategy';
import { RoadControlPoint } from 'app/objects/road/road-control-point';
import { BackTangentPoint, FrontTangentPoint } from 'app/objects/road/road-tangent-point';
import { AutoSpline } from 'app/core/shapes/auto-spline-v2';
import { PointVisualizer } from "../maneuver/point-visualizer";
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { AutoSplineVisualizer, ExplicitSplineVisualizer } from "../../core/visualizers/spline-visualizer";
import { AutoSplineSelectionStrategy, ExplicitSplineSelectionStrategy } from "../../core/strategies/select-strategies/select-spline-strategy";
import { RoadTangentPointController } from "./controllers/road-tangent-point-controller";
import { RoadControlPointController } from "./controllers/road-control-point-controller";
import { SplinePointController } from "./controllers/spline-point-controller";
import { ToolWithHandler } from '../base-tool-v2';
import { ExplicitSplineController } from "./controllers/explicit-spline-controller";
import { AutoSplineController } from "./controllers/auto-spline-controller";
import { RoadControlPointDragHandler } from "./handlers/road-control-point-drag-handler.service";
import { RoadTangentPointDragHandler } from "./handlers/road-tangent-point-drag-handler.service";
import { SplineDragHandler } from "./handlers/spline-drag-handler.service";
import { SplinePointDragHandler } from "./handlers/spline-point-drag-handler.service";
import { RoadControlPointSelectionStrategy, RoadTangentPointSelectionStrategy, SplineControlPointSelectionStrategy } from 'app/core/strategies/select-strategies/point-selection-strategies';
import { RoadStyleAssetDropHandler } from './handlers/road-style-asset-handler';
import { RoadController } from './controllers/road-controller';
import { RoadVisualizer } from './visualizers/road-visualizer';
import { PointCreationRoadToolStrategy, SplineCreationRoadToolStrategy } from './road-tool-creation-strategy';

export class RoadTool extends ToolWithHandler {

	public name: string = 'Road Tool';

	public toolType: ToolType = ToolType.Road;

	private selectedNode: RoadNode;

	constructor ( private tool: RoadToolHelper ) {

		super();

	}

	init (): void {

		this.tool.base.reset();

		this.addSelectionStrategy( SplineControlPoint, new SplineControlPointSelectionStrategy() );
		this.addSelectionStrategy( RoadControlPoint, new RoadControlPointSelectionStrategy() );
		this.addSelectionStrategy( FrontTangentPoint, new RoadTangentPointSelectionStrategy() );
		this.addSelectionStrategy( BackTangentPoint, new RoadTangentPointSelectionStrategy() );
		this.addSelectionStrategy( RoadNode, new NodeStrategy<RoadNode>( RoadNode.lineTag, true ) );
		this.addSelectionStrategy( AutoSpline, new AutoSplineSelectionStrategy() );
		this.addSelectionStrategy( ExplicitSpline, new ExplicitSplineSelectionStrategy() );

		this.addCreationStrategy( this.tool.base.injector.get( SplineCreationRoadToolStrategy ) );
		this.addCreationStrategy( this.tool.base.injector.get( PointCreationRoadToolStrategy ) );

		this.setDebugService( this.tool.toolDebugger );

		this.addControllers();

		this.addVisualizers();

		this.addDragHandlers();

		super.init();

	}

	addVisualizers (): void {

		this.addVisualizer( SplineControlPoint, this.tool.base.injector.get( PointVisualizer ) );
		this.addVisualizer( RoadControlPoint, this.tool.base.injector.get( PointVisualizer ) );
		this.addVisualizer( FrontTangentPoint, this.tool.base.injector.get( PointVisualizer ) );
		this.addVisualizer( BackTangentPoint, this.tool.base.injector.get( PointVisualizer ) );
		this.addVisualizer( AutoSpline, this.tool.base.injector.get( AutoSplineVisualizer ) );
		this.addVisualizer( ExplicitSpline, this.tool.base.injector.get( ExplicitSplineVisualizer ) );
		this.addVisualizer( TvRoad, this.tool.base.injector.get( RoadVisualizer ) );

	}

	addControllers (): void {

		this.addController( SplineControlPoint, this.tool.base.injector.get( SplinePointController ) );
		this.addController( RoadControlPoint, this.tool.base.injector.get( RoadControlPointController ) );
		this.addController( FrontTangentPoint, this.tool.base.injector.get( RoadTangentPointController ) );
		this.addController( BackTangentPoint, this.tool.base.injector.get( RoadTangentPointController ) );
		this.addController( AutoSpline, this.tool.base.injector.get( AutoSplineController ) );
		this.addController( ExplicitSpline, this.tool.base.injector.get( ExplicitSplineController ) );
		this.addController( TvRoad, this.tool.base.injector.get( RoadController ) );

	}

	addDragHandlers (): void {

		this.addDragHandler( SplineControlPoint, this.tool.base.injector.get( SplinePointDragHandler ) );
		this.addDragHandler( RoadControlPoint, this.tool.base.injector.get( RoadControlPointDragHandler ) );
		this.addDragHandler( FrontTangentPoint, this.tool.base.injector.get( RoadTangentPointDragHandler ) );
		this.addDragHandler( BackTangentPoint, this.tool.base.injector.get( RoadTangentPointDragHandler ) );
		this.addDragHandler( AutoSpline, this.tool.base.injector.get( SplineDragHandler ) );
		this.addDragHandler( ExplicitSpline, this.tool.base.injector.get( SplineDragHandler ) );

		this.addAssetHandler( new RoadStyleAssetDropHandler() );

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
