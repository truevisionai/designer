/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Surface } from 'app/map/surface/surface.model';
import { AbstractSplineDebugService } from 'app/services/debug/abstract-spline-debug.service';
import { DebugState } from 'app/services/debug/debug-state';
import { DebugService } from '../../core/interfaces/debug.service';

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceDebugService extends DebugService<Surface> {

	constructor (
		private debug: AbstractSplineDebugService,
	) {
		super();
	}

	setDebugState ( surface: Surface, state: DebugState ): void {

		if ( !surface ) return;

		this.setBaseState( surface, state );

	}

	onDefault ( surface: Surface ): void {

		this.debug.showLines( surface.spline );
		this.debug.showControlPoints( surface.spline );

	}

	onHighlight ( surface: Surface ): void {

		this.debug.showLines( surface.spline );

	}

	onUnhighlight ( surface: Surface ): void {

		// this.splineService.hideLines( surface.spline );

	}

	onSelected ( surface: Surface ): void {

		this.debug.showLines( surface.spline );
		this.debug.showControlPoints( surface.spline );

	}

	onUnselected ( surface: Surface ): void {



	}

	onRemoved ( surface: Surface ): void {

		this.debug.hideLines( surface.spline );
		this.debug.hideControlPoints( surface.spline );

	}

}
