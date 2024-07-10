/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { ManeuverToolService } from 'app/tools/maneuver/maneuver-tool.service';
import { PointerEventData } from 'app/events/pointer-event-data';
import { DebugServiceProvider } from 'app/core/providers/debug-service.provider';
import { SplineControlPoint } from 'app/objects/spline-control-point';
import { DebugState } from "../../services/debug/debug-state";
import { ManeuverMesh } from 'app/services/junction/junction.debug';
import { ManeuverControlPointInspector, ManeuverInspector } from './maneuver.inspector';

export class ManeuverTool extends BaseTool<any> {

	name: string = 'ManeuverTool';

	toolType = ToolType.Maneuver;

	constructor ( private tool: ManeuverToolService ) {

		super();

	}

	init () {

		super.init();

	}

	enable () {

		super.enable();

	}

	disable () {

		super.disable();

		this.tool.junctionDebugger.clear();
		this.tool.maneuverDebugger.clear();

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

	onObjectAdded ( object: any ): void {

		if ( object instanceof SplineControlPoint ) {

			this.tool.addControlPoint( object.spline, object );

		} else {

			super.onObjectAdded( object );

		}

	}

	onObjectRemoved ( object: any ): void {

		if ( object instanceof SplineControlPoint ) {

			this.tool.removeControlPoint( object.spline, object );

		} else {

			super.onObjectRemoved( object );

		}

	}

	onObjectSelected ( object: any ): void {

		const debugService = DebugServiceProvider.instance.createByObjectType( ToolType.Maneuver, object );

		debugService?.onSelected( object );

		if ( object instanceof ManeuverMesh ) {

			this.setInspector( new ManeuverInspector( object ) );

		} else if ( object instanceof SplineControlPoint ) {

			this.setInspector( new ManeuverControlPointInspector( object ) );

		}

	}

	onObjectUnselected ( object: any ) {

		const debugService = DebugServiceProvider.instance.createByObjectType( ToolType.Maneuver, object );

		debugService?.onUnselected( object );

		if ( object instanceof ManeuverMesh ) {

			this.clearInspector();

		} else if ( object instanceof SplineControlPoint ) {

			this.clearInspector();

		}

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof SplineControlPoint ) {

			const firstRoad = this.tool.splineService.findFirstRoad( object.spline );

			const junctionId = firstRoad?.junctionId;

			if ( junctionId ) {

				const junction = this.tool.junctionService.getJunctionById( junctionId );

				if ( junction ) {

					this.tool.junctionDebugger.setDebugState( junction, DebugState.SELECTED );

				}

			}

			this.tool.splineService.update( object.spline );

		} else {

			super.onObjectUpdated( object );

		}

	}

}
