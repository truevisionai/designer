/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { ManeuverToolHelper } from 'app/tools/maneuver/maneuver-tool-helper.service';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { TvJunction } from "../../map/models/junctions/tv-junction";
import { JunctionGatePoint } from "app/objects/junction-gate-point";
import { PointSelectionStrategy } from "../../core/strategies/select-strategies/control-point-strategy";
import { JunctionGatePointSelectionStrategy } from "../../core/strategies/select-strategies/object-tag-strategy";
import { FollowHeadingMovingStrategy } from "../../core/strategies/move-strategies/follow-heading-moving-strategy";
import { ManeuverVisualizer } from './maneuver-visualizer.service';
import { ManeuverToolManeuverMeshController } from './maneuver-object.handler';
import { ManeuverPointController } from './maneuver-point.controller';
import { ManeuverPointVisualizer } from "./point-visualizer";
import { JunctionGateController } from './junction-gate-object-handler';
import { JunctionGateVisualizer } from "./junction-gate-visualizer";
import { maneuverToolHints } from './maneuver-tool.hints';
import { JunctionSelectionStrategy, ManeuverMeshSelectionStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { ToolWithHandler } from '../base-tool-v2';
import { ManeuverToolJunctionController, ManeuverToolJunctionVisualizer } from './handlers';

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
