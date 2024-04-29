/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ToolType } from '../tool-types.enum';
import { BaseTool } from '../base-tool';
import { ManeuverToolService } from 'app/tools/maneuver/maneuver-tool.service';
import { PointerEventData } from 'app/events/pointer-event-data';
import { DebugServiceProvider } from 'app/core/providers/debug-service.provider';
import { SplineControlPoint } from 'app/objects/spline-control-point';

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

	}

	onPointerDownSelect ( e: PointerEventData ): void {

		this.selectionService?.handleSelection( e );

	}

	onObjectSelected ( object: any ): void {

		this.debugService = DebugServiceProvider.instance.createByObjectType( ToolType.Maneuver, object );

		this.debugService?.onSelected( object );

	}

	onObjectUnselected ( object: any ) {

		this.debugService = DebugServiceProvider.instance.createByObjectType( ToolType.Maneuver, object );

		this.debugService?.onUnselected( object );

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof SplineControlPoint ) {

			this.tool.splineService.update( object.spline );

		} else {

			super.onObjectUpdated( object );

		}

	}

}
