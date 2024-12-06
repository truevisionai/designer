/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { PointerEventData } from 'app/events/pointer-event-data';
import { DebugState } from "../../services/debug/debug-state";
import { TrafficLightToolService } from './traffic-light-tool.service';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { ToolWithHandler } from '../base-tool-v2';
import { FollowHeadingMovingStrategy } from 'app/core/strategies/move-strategies/follow-heading-moving-strategy';
import { JunctionGateLineSelectionStrategy } from 'app/core/strategies/select-strategies/object-tag-strategy';
import { JunctionOverlaySelectionStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { JunctionOverlay } from 'app/services/junction/junction-overlay';
import { JunctionGateLine } from 'app/services/junction/junction-gate-line';
import {
	JunctionSignaliztion,
	JunctionSignaliztionController,
	JunctionSignaliztionVisualizer
} from './auto-signalize-junction.service';
import { JunctionGateLineVisualizer } from "./visualizers/junction-gate-line-visualizer";
import { JunctionGateLineController } from "./controllers/junction-gate-line-controller";
import { TrafficLightJunctionVisualizer } from "./visualizers/traffic-light-junction-visualizer";
import { TrafficLightJunctionController } from "./controllers/traffic-light-junction-controller";

export class TrafficLightTool extends ToolWithHandler {

	name: string = 'TrafficLightTool';

	toolType = ToolType.TrafficLight;

	constructor ( private tool: TrafficLightToolService ) {

		super();

	}

	init (): void {

		super.init();

		this.tool.base.reset();

		this.registerStrategies();

		this.registerHandlers();

		this.setDebugService( this.tool.junctionDebugger );

		this.setDataService( this.tool.junctionService );

		for ( const junction of this.tool.junctionService.junctions ) {

			this.tool.defaultDebugger.setDebugState( junction, DebugState.DEFAULT );

		}

	}

	registerStrategies (): void {

		this.selectionService.registerStrategy( JunctionGateLine, new JunctionGateLineSelectionStrategy() );
		this.selectionService.registerStrategy( JunctionOverlay, new JunctionOverlaySelectionStrategy() );

		this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

	}

	registerHandlers (): void {

		this.addController( JunctionSignaliztion, this.tool.base.injector.get( JunctionSignaliztionController ) );
		this.addVisualizer( JunctionSignaliztion, this.tool.base.injector.get( JunctionSignaliztionVisualizer ) );

		// NOTE: not used
		// this.addObjectHandler( ManeuverMesh, this.tool.base.injector.get( ManeuverMeshHandlerTrafficLight ) );
		// this.addOverlayHandler( ManeuverMesh, this.tool.base.injector.get( ManeuverOverlayHandlerTrafficLight ) );

		this.addController( JunctionOverlay, this.tool.base.injector.get( TrafficLightJunctionController ) );
		this.addVisualizer( JunctionOverlay, this.tool.base.injector.get( TrafficLightJunctionVisualizer ) );

		this.addController( JunctionGateLine, this.tool.base.injector.get( JunctionGateLineController ) );
		this.addVisualizer( JunctionGateLine, this.tool.base.injector.get( JunctionGateLineVisualizer ) );

	}

	disable (): void {

		super.disable();

		this.tool.defaultDebugger.clear();
		this.tool.maneuverDebugger.clear();
		this.tool.junctionDebugger.clear();

	}

	onPointerMoved ( e: PointerEventData ): void {

		this.highlight( e );

		if ( !this.isPointerDown ) return;

		if ( !this.currentSelectedPoint ) return;

		if ( !this.currentSelectedPoint.isSelected ) return;

		const newPosition = this.selectionService.handleTargetMovement( e, this.currentSelectedPoint );

		this.currentSelectedPoint.setPosition( newPosition.position );

		// this.dataService.updatePoint( this.currentSelectedPoint.mainObject, this.currentSelectedPoint );

		// this.debugService.setDebugState( this.currentSelectedPoint.mainObject, DebugState.SELECTED );

		this.currentSelectedPointMoved = true;

	}

}
