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
import { TrafficLightJunctionController, TrafficLightJunctionVisualizer } from './junction-handler-traffic-light';
import { JunctionGateLineController, JunctionGateLineVisualizer } from './junction-gate-line-handlers';
import { JunctionGateLine } from 'app/services/junction/junction-gate-line';
import { JunctionSignaliztion, JunctionSignaliztionController, JunctionSignaliztionVisualizer } from './auto-signalize-junction.service';

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

		this.selectionService.registerStrategy( JunctionGateLine.name, new JunctionGateLineSelectionStrategy() );
		// this.selectionService.registerStrategy( ManeuverMesh.name, new ManeuverMeshSelectionStrategy() );
		this.selectionService.registerStrategy( JunctionOverlay.name, new JunctionOverlaySelectionStrategy() );

		this.selectionService.registerTag( ManeuverMesh.name, ManeuverMesh.name );
		this.selectionService.registerTag( JunctionOverlay.name, JunctionOverlay.name );

		this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

		this.setTypeName( TvJunction.name );

	}

	registerHandlers (): void {

		this.addController( JunctionSignaliztion.name, this.tool.base.injector.get( JunctionSignaliztionController ) );
		this.addVisualizer( JunctionSignaliztion.name, this.tool.base.injector.get( JunctionSignaliztionVisualizer ) );

		// NOTE: not used
		// this.addObjectHandler( ManeuverMesh.name, this.tool.base.injector.get( ManeuverMeshHandlerTrafficLight ) );
		// this.addOverlayHandler( ManeuverMesh.name, this.tool.base.injector.get( ManeuverOverlayHandlerTrafficLight ) );

		this.addController( JunctionOverlay.name, this.tool.base.injector.get( TrafficLightJunctionController ) );
		this.addVisualizer( JunctionOverlay.name, this.tool.base.injector.get( TrafficLightJunctionVisualizer ) );

		this.addController( JunctionGateLine.name, this.tool.base.injector.get( JunctionGateLineController ) );
		this.addVisualizer( JunctionGateLine.name, this.tool.base.injector.get( JunctionGateLineVisualizer ) );

	}

	disable () {

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

		this.currentSelectedPoint.copyPosition( newPosition.position );

		// this.dataService.updatePoint( this.currentSelectedPoint.mainObject, this.currentSelectedPoint );

		// this.debugService.setDebugState( this.currentSelectedPoint.mainObject, DebugState.SELECTED );

		this.currentSelectedPointMoved = true;

	}

}
