/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { DynamicControlPoint } from 'app/modules/three-js/objects/dynamic-control-point';
import { TvSurface } from '../../../modules/tv-map/models/tv-surface.model';
import { BaseCommand } from '../../commands/base-command';
import { SurfaceTool } from './surface-tool';

export class UnselectSurfaceCommand extends BaseCommand {

	private readonly oldPoint: DynamicControlPoint<TvSurface>;
	private readonly oldSurface: TvSurface;

	constructor ( private tool: SurfaceTool ) {

		super();

		this.oldSurface = this.tool.surface;
		this.oldPoint = this.tool.point;

	}

	execute () {

		this.oldPoint?.unselect();

		this.tool.point = null;
		this.tool.surface = null;

	}

	undo (): void {

		this.oldPoint?.select();

		this.tool.point = this.oldPoint;
		this.tool.surface = this.oldSurface;

	}

	redo (): void {

		this.execute();

	}

}
