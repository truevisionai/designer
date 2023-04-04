/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint, BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { BaseCommand } from './base-command';
import { SurfaceTool } from '../tools/surface-tool';

export class AddSurfaceControlPointCommand extends BaseCommand {

	constructor ( private tool: SurfaceTool, private surface: TvSurface, private cp: BaseControlPoint ) {

		super();

	}

	execute () {

		this.cp.mainObject = this.surface;

		this.surface.spline.addControlPoint( this.cp );

		this.surface.update();

	}

	undo (): void {

		this.tool.shapeEditor.removeControlPoint( this.cp );

		this.surface.spline.removeControlPoint( this.cp );

		this.surface.update();

	}

	redo (): void {

		this.cp.mainObject = this.surface;

		this.tool.shapeEditor.pushControlPoint( this.cp );

		this.surface.spline.addControlPoint( this.cp );

		this.surface.update();

	}

}
