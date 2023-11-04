/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { Vector3 } from 'three';
import { DynamicControlPoint } from '../../modules/three-js/objects/dynamic-control-point';
import { BaseCommand } from '../../commands/base-command';
import { SceneService } from '../../services/scene.service';
import { CatmullRomSpline } from '../../core/shapes/catmull-rom-spline';
import { SurfaceTool } from './surface-tool';
import { MapEvents } from 'app/events/map-events';

export class CreateSurfaceCommand extends BaseCommand {

	private readonly newSurface: TvSurface;

	private readonly oldSurface?: TvSurface;
	private readonly oldPoint?: DynamicControlPoint<TvSurface>;
	private readonly newPoint: DynamicControlPoint<TvSurface>;

	constructor ( private tool: SurfaceTool, private position: Vector3 ) {

		super();

		this.oldPoint = this.tool.point;
		this.oldSurface = this.tool.surface;

		this.newSurface = new TvSurface( 'grass', new CatmullRomSpline() );

		this.newPoint = new DynamicControlPoint( this.newSurface, position );

	}

	execute () {

		this.oldPoint?.unselect();

		this.tool.point = this.newPoint;

		this.newPoint?.select();

		this.map.surfaces.push( this.newSurface );

		this.newSurface.addControlPoint( this.newPoint );

		this.tool.surface = this.newSurface;

		SceneService.addToMain( this.newPoint );
	}

	undo () {

		this.newPoint?.unselect();

		this.tool.point = this.oldPoint;

		this.oldPoint?.select();

		const index = this.map.surfaces.indexOf( this.newSurface );

		if ( index !== -1 ) {

			this.map.surfaces.splice( index, 1 );

		}

		this.newSurface.removeControlPoint( this.newPoint );

		this.tool.surface = this.oldSurface;

		SceneService.removeFromMain( this.newPoint );
	}

	redo (): void {

		this.execute();

	}

}

export class CreateSurfaceCommandv2 extends BaseCommand {

	constructor ( private surface: TvSurface ) {

		super();

	}

	execute () {

		this.map.addSurface( this.surface );

		MapEvents.objectSelected.emit( this.surface );

	}

	undo () {

		this.map.removeSurface( this.surface );

	}

	redo (): void {

		this.execute();

	}

}
