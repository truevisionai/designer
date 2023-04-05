/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { AnyControlPoint } from 'app/modules/three-js/objects/control-point';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { CatmullRomSpline } from '../shapes/catmull-rom-spline';
import { BaseCommand } from './base-command';
import { SurfaceTool } from '../tools/surface-tool';

export class CreateSurfaceCommand extends BaseCommand {

	private surface: TvSurface;

	constructor ( private tool: SurfaceTool, private point: AnyControlPoint ) {

		super();

	}

	execute () {

		if ( !this.surface ) {

			this.surface = new TvSurface( "grass", new CatmullRomSpline() );

		}

		this.map.surfaces.push( this.surface );

		this.surface.addControlPoint( this.point );

		this.tool.surface = this.surface;
	}

	undo () {

		const index = this.map.surfaces.indexOf( this.surface );

		if ( index !== -1 ) {

			this.map.surfaces.splice( index, 1 );

		}

		this.surface.removeControlPoint( this.point );

		this.tool.surface = null;
	}

	redo (): void {

		this.execute();

	}

}
