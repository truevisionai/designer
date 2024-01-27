/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvSurface } from 'app/map/models/tv-surface.model';
import { AbstractSplineDebugService } from 'app/services/debug/abstract-spline-debug.service';
import { DebugState } from 'app/services/debug/debug-state';
import { DebugService } from '../../services/debug/debug.service';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceDebugService extends DebugService<TvSurface> {

	constructor (
		private debug: AbstractSplineDebugService,
	) {
		super();
	}

	setDebugState ( surface: TvSurface, state: DebugState ): void {

		if ( !surface ) return;

		this.setBaseState( surface, state );

	}

	onDefault ( surface: TvSurface ): void {

		this.debug.showLines( surface.spline );
		this.debug.showControlPoints( surface.spline );

	}

	onHighlight ( surface: TvSurface ): void {

		this.debug.showLines( surface.spline );

	}

	onUnhighlight ( surface: TvSurface ): void {

		// this.splineService.hideLines( surface.spline );

	}

	onSelected ( surface: TvSurface ): void {

		this.debug.showLines( surface.spline );
		this.debug.showControlPoints( surface.spline );

	}

	onUnselected ( surface: TvSurface ): void {



	}

	onRemoved ( surface: TvSurface ): void {

		this.debug.hideLines( surface.spline );
		this.debug.hideControlPoints( surface.spline );

	}

}
