/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Surface } from 'app/map/surface/surface.model';
import { ToolType } from '../tool-types.enum';
import { SurfaceToolService } from './surface-tool.service';
import { AbstractControlPoint } from 'app/objects/abstract-control-point';
import { AppInspector } from 'app/core/inspector';
import { TvSurfaceInspector } from '../../map/surface/surface.inspector';
import { BaseSplineTool } from "../base-spline-tool";
import { DebugState } from 'app/services/debug/debug-state';

export class SurfaceTool extends BaseSplineTool<Surface> {

	name: string = 'Surface Tool';

	toolType: ToolType = ToolType.Surface;

	constructor ( private tool: SurfaceToolService ) {

		super();

	}

	onShowInspector ( surface: Surface, controlPoint?: AbstractControlPoint ): void {

		const mesh = this.tool.getSurfaceMesh( surface );

		AppInspector.setDynamicInspector( new TvSurfaceInspector( surface, mesh, this.tool, controlPoint ) );

	}

	onObjectUpdated ( object: any ): void {

		if ( object instanceof TvSurfaceInspector ) {

			this.dataService.update( object.surface );

			this.debugService.updateDebugState( object.surface, DebugState.SELECTED );

		} else if ( object instanceof Surface ) {

			this.dataService.update( object );

			this.debugService.updateDebugState( object, DebugState.SELECTED );

		} else {

			super.onObjectUpdated( object );

		}

	}
}

