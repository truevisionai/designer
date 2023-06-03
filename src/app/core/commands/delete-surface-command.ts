/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint, BaseControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { BaseCommand } from './base-command';
import { SurfaceTool } from '../tools/surface/surface-tool';

export class DeleteSurfaceCommand extends BaseCommand {

	constructor ( private tool: SurfaceTool, private surface: TvSurface ) {

		super();

	}

	execute () {

		this.surface.delete();

		const index = this.map.surfaces.findIndex( s => s.id == this.surface.id );

		if ( index > -1 ) {

			this.map.surfaces.splice( index, 1 );

		}

		this.tool.surface = null;

		delete this.tool.surface;
	}

	undo (): void {

		this.map.surfaces.push( this.surface );

		this.surface.showControlPoints();

		this.surface.showCurve();

		this.surface.mesh.visible = true;

		this.tool.surface = this.surface;

	}

	redo (): void {

		this.execute();

	}

}
