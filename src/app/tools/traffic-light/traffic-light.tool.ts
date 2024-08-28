/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { PointerEventData } from 'app/events/pointer-event-data';
import { DebugState } from "../../services/debug/debug-state";
import { TrafficLightToolService } from './traffic-light-tool.service';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvJunctionSignalizationInspector } from './tv-junction-signalization.inspector';
import { DebugLine } from "../../objects/debug-line";
import { JunctionGateInspector } from "./junction-gate-inspector";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { ManeuverSignalizationInspector } from "./maneuver-signalization.inspector";
import { TvLaneCoord } from "../../map/models/tv-lane-coord";
import { Maths } from "../../utils/maths";
import { TvRoadSignal } from "../../map/road-signal/tv-road-signal.model";
import { ToolWithHandler } from '../base-tool-v2';
import { FollowHeadingMovingStrategy } from 'app/core/strategies/move-strategies/follow-heading-moving-strategy';
import { ObjectTagStrategy } from 'app/core/strategies/select-strategies/object-tag-strategy';
import { ObjectUserDataStrategy } from 'app/core/strategies/select-strategies/object-user-data-strategy';
import { ManeuverObjectHandler } from '../maneuver/maneuver-object.handler';
import { ManeuverOverlayHandler } from '../maneuver/maneuver-overlay.handler';
import { JunctionOverlay } from 'app/services/junction/junction-overlay';
import { JunctionHandlerTrafficLight, JunctionOverlayHandlerTrafficLight } from './junction-handler-traffic-light';
import { JunctionGateLineHandler, JunctionGateLineOverlayHandler } from './junction-gate-line-handlers';
import { JunctionGateLine } from 'app/services/junction/junction-gate-line';
import { JunctionSignaliztion, JunctionSignaliztionHandler, JunctionSignaliztionOverlayHandler } from './auto-signalize-junction.service';

export class TrafficLightTool extends ToolWithHandler<any> {

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

		// this.selectionService.registerStrategy( SimpleControlPoint.name, new ControlPointStrategy() );
		this.selectionService.registerStrategy( JunctionGateLine.name, new ObjectTagStrategy( JunctionGateLine.tag ) );
		this.selectionService.registerStrategy( ManeuverMesh.name, new ObjectTagStrategy( 'link' ) );
		this.selectionService.registerStrategy( JunctionOverlay.name, new ObjectUserDataStrategy( 'junction' ) );

		// this.selectionService.registerTag( SimpleControlPoint.name, SimpleControlPoint.name );
		// this.selectionService.registerTag( SplineControlPoint.name, SimpleControlPoint.name );
		this.selectionService.registerTag( ManeuverMesh.name, ManeuverMesh.name );
		this.selectionService.registerTag( JunctionOverlay.name, JunctionOverlay.name );

		this.selectionService.addMovingStrategy( new FollowHeadingMovingStrategy() );

		this.setTypeName( TvJunction.name );

	}

	registerHandlers (): void {

		// this.addObjectHandler( SplineControlPoint.name, this.tool.base.injector.get( ManeuverPointHandler ) );
		// this.addObjectHandler( JunctionGatePoint.name, this.tool.base.injector.get( JunctionGateHandler ) );
		this.addObjectHandler( JunctionSignaliztion.name, this.tool.base.injector.get( JunctionSignaliztionHandler ) );
		this.addObjectHandler( ManeuverMesh.name, this.tool.base.injector.get( ManeuverObjectHandler ) );
		this.addObjectHandler( JunctionOverlay.name, this.tool.base.injector.get( JunctionHandlerTrafficLight ) );
		this.addObjectHandler( JunctionGateLine.name, this.tool.base.injector.get( JunctionGateLineHandler ) );

		// this.addOverlayHandler( SplineControlPoint.name, this.tool.base.injector.get( PointOverlayHandler ) );
		// this.addOverlayHandler( JunctionGatePoint.name, this.tool.base.injector.get( JunctionGateOverlayHandler ) );
		this.addOverlayHandler( JunctionSignaliztion.name, this.tool.base.injector.get( JunctionSignaliztionOverlayHandler ) );
		this.addOverlayHandler( ManeuverMesh.name, this.tool.base.injector.get( ManeuverOverlayHandler ) );
		this.addOverlayHandler( JunctionOverlay.name, this.tool.base.injector.get( JunctionOverlayHandlerTrafficLight ) );
		this.addOverlayHandler( JunctionGateLine.name, this.tool.base.injector.get( JunctionGateLineOverlayHandler ) );

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

	showObjectInspector ( object: object ): void {

		if ( object instanceof TvJunction ) {

			// this.tool.junctionDebugger.onSelected( object );

			this.setInspector( new TvJunctionSignalizationInspector( object ) );

		} else if ( object instanceof JunctionGateLine ) {

			// const signal = this.findSignal( object );

			// if ( !signal ) return;

			// this.tool.junctionGateDebugger.onSelected( signal );

			this.setInspector( new JunctionGateInspector() );

		} else if ( object instanceof ManeuverMesh ) {

			// this.tool.junctionManeuverDebugger.onSelected( object );

			this.setInspector( new ManeuverSignalizationInspector( object ) );

		} else if ( object instanceof JunctionOverlay ) {

			this.setInspector( new TvJunctionSignalizationInspector( object.junction ) );

		}

	}

	private findSignal ( object: DebugLine<TvLaneCoord> ): TvRoadSignal | undefined {

		return object.target.road.getRoadSignals().find( signal => signal.type == "294" && Maths.approxEquals( signal.s, object.target.s ) );

	}
}
