/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { ManeuverToolHelper } from 'app/tools/maneuver/maneuver-tool-helper.service';
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { JunctionGatePoint } from "app/objects/junctions/junction-gate-point";
import { JunctionGatePointSelectionStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { ManeuverVisualizer } from './visualizers/maneuver-visualizer';
import { ManeuverToolManeuverMeshController } from './controllers/maneuver-tool-maneuver-mesh-controller';
import { ManeuverPointController, ManeuverRoadTangentPointController } from './controllers/maneuver-point.controller';
import { JunctionGateController } from './controllers/junction-gate-point-controller';
import { JunctionGatePointVisualizer } from "./visualizers/junction-gate-point-visualizer";
import { maneuverToolHints } from './maneuver-tool.hints';
import { JunctionOverlaySelectionStrategy, ManeuverMeshSelectionStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { ToolWithHandler } from '../base-tool-v2';
import { ManeuverToolJunctionOverlayController } from "./controllers/maneuver-tool-junction-controller";
import { ManeuverToolJunctionOverlayVisualizer } from "./visualizers/maneuver-tool-junction-visualizer";
import { ManeuverPointVisualizer } from "./visualizers/maneuver-point-visualizer";
import { JunctionOverlay } from 'app/services/junction/junction-overlay';
import { ManeuverRoadControlPointDragHandler, ManeuverRoadTangentPointDragHandler, ManeuverSplineControlPointDragHandler } from "./controllers/maneuver-point-drag-handler.service";
import {
	RoadControlPointSelectionStrategy,
	RoadTangentPointSelectionStrategy,
	SplineControlPointSelectionStrategy
} from "../../core/strategies/select-strategies/point-selection-strategies";
import { RoadControlPoint } from 'app/objects/road/road-control-point';
import { BackTangentPoint, FrontTangentPoint } from 'app/objects/road/road-tangent-point';
import { AutoSpline } from 'app/core/shapes/auto-spline-v2';
import { ExplicitSpline } from 'app/core/shapes/explicit-spline';
import { AutoSplineController } from '../road/controllers/auto-spline-controller';
import { ExplicitSplineController } from '../road/controllers/explicit-spline-controller';
import { ManeuverSplineVisualizer } from './visualizers/maneuver-spline-visualizer';

export class ManeuverTool extends ToolWithHandler {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	constructor ( public helper: ManeuverToolHelper ) {

		super();

	}

	init (): void {

		this.addStrategies();

		this.addControllers();

		this.addVisualizers();

		this.addDragHandlers();

		this.setDebugService( this.helper.junctionDebugger );

		this.setDataService( this.helper.junctionService );

		this.setHintConfig( maneuverToolHints );

		super.init();

	}

	addStrategies (): void {

		this.selectionService = this.helper.base.selection;

		this.addSelectionStrategy( JunctionGatePoint, new JunctionGatePointSelectionStrategy() );
		this.addSelectionStrategy( SplineControlPoint, new SplineControlPointSelectionStrategy() );
		this.addSelectionStrategy( RoadControlPoint, new RoadControlPointSelectionStrategy() );
		this.addSelectionStrategy( FrontTangentPoint, new RoadTangentPointSelectionStrategy() );
		this.addSelectionStrategy( BackTangentPoint, new RoadTangentPointSelectionStrategy() );
		this.addSelectionStrategy( ManeuverMesh, new ManeuverMeshSelectionStrategy() );
		this.addSelectionStrategy( JunctionOverlay, new JunctionOverlaySelectionStrategy() );

	}

	addControllers (): void {

		this.addController( SplineControlPoint, this.helper.base.injector.get( ManeuverPointController ) );
		this.addController( RoadControlPoint, this.helper.base.injector.get( ManeuverPointController ) );
		this.addController( FrontTangentPoint, this.helper.base.injector.get( ManeuverRoadTangentPointController ) );
		this.addController( BackTangentPoint, this.helper.base.injector.get( ManeuverRoadTangentPointController ) );

		this.addController( JunctionGatePoint, this.helper.base.injector.get( JunctionGateController ) );
		this.addController( ManeuverMesh, this.helper.base.injector.get( ManeuverToolManeuverMeshController ) );
		this.addController( JunctionOverlay, this.helper.base.injector.get( ManeuverToolJunctionOverlayController ) );

		this.addController( AutoSpline, this.helper.base.injector.get( AutoSplineController ) );
		this.addController( ExplicitSpline, this.helper.base.injector.get( ExplicitSplineController ) );

	}

	addVisualizers (): void {

		this.addVisualizer( SplineControlPoint, this.helper.base.injector.get( ManeuverPointVisualizer ) );
		this.addVisualizer( RoadControlPoint, this.helper.base.injector.get( ManeuverPointVisualizer ) );
		this.addVisualizer( FrontTangentPoint, this.helper.base.injector.get( ManeuverPointVisualizer ) );
		this.addVisualizer( BackTangentPoint, this.helper.base.injector.get( ManeuverPointVisualizer ) );

		this.addVisualizer( JunctionGatePoint, this.helper.base.injector.get( JunctionGatePointVisualizer ) );
		this.addVisualizer( ManeuverMesh, this.helper.base.injector.get( ManeuverVisualizer ) );
		this.addVisualizer( JunctionOverlay, this.helper.base.injector.get( ManeuverToolJunctionOverlayVisualizer ) );

		this.addVisualizer( AutoSpline, this.helper.base.injector.get( ManeuverSplineVisualizer ) );
		this.addVisualizer( ExplicitSpline, this.helper.base.injector.get( ManeuverSplineVisualizer ) );

	}

	addDragHandlers (): void {

		this.addDragHandler( SplineControlPoint, this.helper.base.injector.get( ManeuverSplineControlPointDragHandler ) );
		this.addDragHandler( RoadControlPoint, this.helper.base.injector.get( ManeuverRoadControlPointDragHandler ) );
		this.addDragHandler( FrontTangentPoint, this.helper.base.injector.get( ManeuverRoadTangentPointDragHandler ) );
		this.addDragHandler( BackTangentPoint, this.helper.base.injector.get( ManeuverRoadTangentPointDragHandler ) );

	}

	disable (): void {

		super.disable();

		this.helper.junctionDebugger.clear();
		this.helper.maneuverDebugger.clear();

	}

}
