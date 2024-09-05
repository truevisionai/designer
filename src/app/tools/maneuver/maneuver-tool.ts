/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { ManeuverToolHelper } from 'app/tools/maneuver/maneuver-tool-helper.service';
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { JunctionGatePoint } from "app/objects/junctions/junction-gate-point";
import { PointSelectionStrategy } from "../../core/strategies/select-strategies/control-point-strategy";
import { JunctionGatePointSelectionStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { FollowHeadingMovingStrategy } from "../../core/strategies/move-strategies/follow-heading-moving-strategy";
import { ManeuverVisualizer } from './visualizers/maneuver-visualizer';
import { ManeuverToolManeuverMeshController } from './controllers/maneuver-tool-maneuver-mesh-controller';
import { ManeuverPointController } from './controllers/maneuver-point.controller';
import { JunctionGateController } from './controllers/junction-gate-point-controller';
import { JunctionGatePointVisualizer } from "./visualizers/junction-gate-point-visualizer";
import { maneuverToolHints } from './maneuver-tool.hints';
import { JunctionOverlaySelectionStrategy, ManeuverMeshSelectionStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { ToolWithHandler } from '../base-tool-v2';
import { ManeuverToolJunctionOverlayController } from "./controllers/maneuver-tool-junction-controller";
import { ManeuverToolJunctionOverlayVisualizer } from "./visualizers/maneuver-tool-junction-visualizer";
import { ManeuverPointVisualizer } from "./visualizers/maneuver-point-visualizer";
import { JunctionOverlay } from 'app/services/junction/junction-overlay';
import { ManeuverPointDragHandler } from "./controllers/maneuver-point-drag-handler.service";
import {
	SplineControlPointSelectionStrategy
} from "../../core/strategies/select-strategies/point-selection-strategies";

export class ManeuverTool extends ToolWithHandler {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	constructor ( public helper: ManeuverToolHelper ) {

		super();

	}

	init (): void {

		this.addStrategies();

		this.addHandlers();

		this.setDebugService( this.helper.junctionDebugger );

		this.setDataService( this.helper.junctionService );

		this.setHintConfig( maneuverToolHints );

		super.init();

	}

	addStrategies (): void {

		this.selectionService = this.helper.base.selection;

		this.addSelectionStrategy( JunctionGatePoint, new JunctionGatePointSelectionStrategy() );
		this.addSelectionStrategy( SplineControlPoint, new SplineControlPointSelectionStrategy() );
		this.addSelectionStrategy( ManeuverMesh, new ManeuverMeshSelectionStrategy() );
		this.addSelectionStrategy( JunctionOverlay, new JunctionOverlaySelectionStrategy() );

		this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

	}

	addHandlers (): void {

		this.addController( SplineControlPoint, this.helper.base.injector.get( ManeuverPointController ) );
		this.addController( JunctionGatePoint, this.helper.base.injector.get( JunctionGateController ) );
		this.addController( ManeuverMesh, this.helper.base.injector.get( ManeuverToolManeuverMeshController ) );
		this.addController( JunctionOverlay, this.helper.base.injector.get( ManeuverToolJunctionOverlayController ) );

		this.addVisualizer( SplineControlPoint, this.helper.base.injector.get( ManeuverPointVisualizer ) );
		this.addVisualizer( JunctionGatePoint, this.helper.base.injector.get( JunctionGatePointVisualizer ) );
		this.addVisualizer( ManeuverMesh, this.helper.base.injector.get( ManeuverVisualizer ) );
		this.addVisualizer( JunctionOverlay, this.helper.base.injector.get( ManeuverToolJunctionOverlayVisualizer ) );

		this.addDragHandler( SplineControlPoint, this.helper.base.injector.get( ManeuverPointDragHandler ) );

	}

	disable (): void {

		super.disable();

		this.helper.junctionDebugger.clear();
		this.helper.maneuverDebugger.clear();

	}

}
