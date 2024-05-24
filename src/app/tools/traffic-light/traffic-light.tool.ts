/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { PointerEventData } from 'app/events/pointer-event-data';
import { DebugServiceProvider } from 'app/core/providers/debug-service.provider';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { DebugState } from "../../services/debug/debug-state";
import { TrafficLightToolService } from './traffic-light-tool.service';
import { TvJunction } from 'app/map/models/junctions/tv-junction';
import { TvJunctionSignalizationInspector } from './tv-junction-signalization.inspector';
import { DebugLine } from "../../objects/debug-line";
import { JunctionGateInspector } from "./junction-gate-inspector";
import { ManeuverMesh } from "../../services/junction/junction.debug";
import { ManeuverSignalizationInspector } from "./maneuver-signalization.inspector";
import { TvLaneCoord } from "../../map/models/tv-lane-coord";
import { Maths } from "../../utils/maths";
import { TvRoadSignal } from "../../map/road-signal/tv-road-signal.model";

export class TrafficLightTool extends BaseTool<any> {

	name: string = 'TrafficLightTool';

	toolType = ToolType.TrafficLight;

	constructor ( private tool: TrafficLightToolService ) {

		super();

	}

	init () {

		super.init();

		for ( const junction of this.tool.junctionService.junctions ) {

			this.tool.defaultDebugger.setDebugState( junction, DebugState.DEFAULT );

		}

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.tool.defaultDebugger.clear();
		this.tool.maneuverDebugger.clear();
		this.tool.junctionDebugger.clear();

	}

	onPointerMoved ( e: PointerEventData ) {

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

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService?.handleSelection( e );

	}

	onObjectSelected ( object: any ): void {

		console.log( 'onObjectSelected', object );

		const debugService = DebugServiceProvider.instance.createByObjectType( ToolType.TrafficLight, object );

		debugService?.onSelected( object );

		if ( object instanceof TvJunction ) {

			this.tool.junctionDebugger.onSelected( object );

			this.setInspector( new TvJunctionSignalizationInspector( object, this.tool ) );

		} else if ( object instanceof DebugLine ) {

			const signal = this.findSignal( object );

			if ( !signal ) return;

			this.tool.junctionGateDebugger.onSelected( signal );

			this.setInspector( new JunctionGateInspector() );

		} else if ( object instanceof ManeuverMesh ) {

			this.tool.junctionManeuverDebugger.onSelected( object );

			this.setInspector( new ManeuverSignalizationInspector( object ) );

		}
	}

	onObjectUnselected ( object: any ) {

		const debugService = DebugServiceProvider.instance.createByObjectType( ToolType.Maneuver, object );

		debugService?.onUnselected( object );

		if ( object instanceof TvJunction ) {

			this.tool.junctionDebugger.onUnselected( object );

			this.clearInspector();

		} else if ( object instanceof DebugLine ) {

			const signal = this.findSignal( object );

			if ( !signal ) return;

			this.tool.junctionGateDebugger.onUnselected( signal );

			this.clearInspector();

		} else if ( object instanceof ManeuverMesh ) {

			this.clearInspector();

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof SplineControlPoint ) {

			const junctionId = object.spline.getRoads()[ 0 ]?.junctionId;

			if ( junctionId ) {

				// const junction = this.tool.junctionService.getJunctionById( junctionId );

				// if ( junction ) {

				// 	this.tool.junctionDebugger.setDebugState( junction, DebugState.SELECTED );

				// }

			}

			// this.tool.splineService.update( object.spline );

		} else {

			super.onObjectUpdated( object );

		}

	}

	private findSignal ( object: DebugLine<TvLaneCoord> ): TvRoadSignal | undefined {

		return object.target.road.getRoadSignals().find( signal => signal.type == "294" && Maths.approxEquals( signal.s, object.target.s ) );

	}
}
