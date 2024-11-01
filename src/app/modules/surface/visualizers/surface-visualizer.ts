/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";
import { Surface } from "app/map/surface/surface.model";
import { SplineDebugService } from "app/services/debug/spline-debug.service";

@Injectable()
export class SurfaceVisualizer extends BaseVisualizer<Surface> {

	constructor (
		private splineDebugService: SplineDebugService,
	) {
		super();
	}

	onHighlight ( object: Surface ): void {
		this.splineDebugService.showPolyline( object.spline );
	}

	onSelected ( object: Surface ): void {
		this.splineDebugService.showPolyline( object.spline );
		this.splineDebugService.showControlPoints( object.spline );
	}

	onDefault ( object: Surface ): void {
		this.splineDebugService.removePolyline( object.spline );
	}

	onUnselected ( object: Surface ): void {
		this.splineDebugService.removeControlPoints( object.spline );
		this.splineDebugService.removePolyline( object.spline );
	}

	onAdded ( object: Surface ): void {
		//
	}

	onUpdated ( object: Surface ): void {
		this.splineDebugService.removePolyline( object.spline );
		this.splineDebugService.removeControlPoints( object.spline );

		this.splineDebugService.showPolyline( object.spline );
		this.splineDebugService.showControlPoints( object.spline );
	}

	onRemoved ( object: Surface ): void {
		this.splineDebugService.removePolyline( object.spline );
		this.splineDebugService.removeControlPoints( object.spline );
	}

	onClearHighlight (): void {
		this.highlighted.forEach( object => this.onRemoved( object ) );
	}

	clear (): void {
		this.highlighted.clear();
	}

}



