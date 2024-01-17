import { Injectable } from '@angular/core';
import { TvSurface } from 'app/modules/tv-map/models/tv-surface.model';
import { AbstractSplineDebugService } from 'app/services/debug/abstract-spline-debug.service';
import { DebugState } from 'app/services/debug/debug-state';

export interface DebugService {
	setDebugState ( object: any, state: DebugState ): void;
}

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceDebugService implements DebugService {

	constructor (
		private splineService: AbstractSplineDebugService,
	) { }

	setDebugState ( surface: TvSurface, state: DebugState ): void {

		switch ( state ) {

			case DebugState.DEFAULT:
				this.splineService.showLines( surface.spline );
				this.splineService.hideControlPoints( surface.spline );
				break;

			case DebugState.HIGHLIGHTED:
				this.splineService.showLines( surface.spline );
				break;

			case DebugState.SELECTED:
				this.splineService.showLines( surface.spline );
				this.splineService.showControlPoints( surface.spline );
				break;

			case DebugState.REMOVED:
				this.splineService.hideLines( surface.spline );
				this.splineService.hideControlPoints( surface.spline );
				break;

		}

	}

}
