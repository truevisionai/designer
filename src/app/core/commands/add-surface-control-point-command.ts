/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint, BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { BaseCommand } from './base-command';
import { SurfaceTool } from '../tools/surface-tool';

export class AddSurfaceControlPointCommand extends BaseCommand {

	constructor ( private tool: SurfaceTool, private surface: TvSurface, private point: BaseControlPoint ) {

		super();

	}

	execute () {

		this.surface.addControlPoint( this.point );

	}

	undo (): void {

		this.tool.shapeEditor.removeControlPoint( this.point );

		this.surface.removeControlPoint( this.point );

	}

	redo (): void {

		this.tool.shapeEditor.pushControlPoint( this.point );

		this.surface.addControlPoint( this.point );
	}

}
