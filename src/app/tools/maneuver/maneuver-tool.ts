/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { ManeuverToolHelper } from 'app/tools/maneuver/maneuver-tool-helper.service';
import { SplineControlPoint } from 'app/objects/road/spline-control-point';
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { JunctionGatePoint } from "app/objects/junctions/junction-gate-point";
import { PointSelectionStrategy } from "../../core/strategies/select-strategies/control-point-strategy";
import { JunctionGatePointSelectionStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { FollowHeadingMovingStrategy } from "../../core/strategies/move-strategies/follow-heading-moving-strategy";
import { ManeuverVisualizer } from './visualizers/maneuver-visualizer';
import { ManeuverToolManeuverMeshController } from './controllers/maneuver-tool-maneuver-mesh-controller';
import { ManeuverPointController } from './controllers/maneuver-point.controller';
import { JunctionGateController } from './controllers/junction-gate-point-controller';
import { JunctionGateVisualizer } from "./visualizers/junction-gate-visualizer";
import { maneuverToolHints } from './maneuver-tool.hints';
import { JunctionSelectionStrategy, ManeuverMeshSelectionStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { ToolWithHandler } from '../base-tool-v2';
import { ManeuverToolJunctionController } from "./controllers/maneuver-tool-junction-controller";
import { ManeuverToolJunctionVisualizer } from "./visualizers/maneuver-tool-junction-visualizer";
import { ManeuverPointVisualizer } from "./visualizers/maneuver-point-visualizer";

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

		this.selectionService.registerStrategy( JunctionGatePoint.name, new JunctionGatePointSelectionStrategy() );
		this.selectionService.registerStrategy( SplineControlPoint.name, new PointSelectionStrategy() );
		this.selectionService.registerStrategy( ManeuverMesh.name, new ManeuverMeshSelectionStrategy() );
		this.selectionService.registerStrategy( TvJunction.name, new JunctionSelectionStrategy() );

		this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

		this.setTypeName( TvJunction.name );

	}

	addHandlers (): void {

		this.addController( SplineControlPoint.name, this.helper.base.injector.get( ManeuverPointController ) );
		this.addController( JunctionGatePoint.name, this.helper.base.injector.get( JunctionGateController ) );
		this.addController( ManeuverMesh.name, this.helper.base.injector.get( ManeuverToolManeuverMeshController ) );
		this.addController( TvJunction.name, this.helper.base.injector.get( ManeuverToolJunctionController ) );

		this.addVisualizer( SplineControlPoint.name, this.helper.base.injector.get( ManeuverPointVisualizer ) );
		this.addVisualizer( JunctionGatePoint.name, this.helper.base.injector.get( JunctionGateVisualizer ) );
		this.addVisualizer( ManeuverMesh.name, this.helper.base.injector.get( ManeuverVisualizer ) );
		this.addVisualizer( TvJunction.name, this.helper.base.injector.get( ManeuverToolJunctionVisualizer ) );

	}

	disable (): void {

		super.disable();

		this.helper.junctionDebugger.clear();
		this.helper.maneuverDebugger.clear();

	}

}
