/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { Log } from "app/core/utils/log";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";
import { SplineDebugService } from "app/services/debug/spline-debug.service";
import { JunctionDebugService } from "app/services/junction/junction.debug";


@Injectable( {
	providedIn: 'root'
} )
export class ManeuverSplineVisualizer<T extends AbstractSpline> extends BaseVisualizer<T> {

	constructor (
		private splineDebugService: SplineDebugService,
		private junctionDebugService: JunctionDebugService
	) {

		super();

	}

	onAdded ( object: AbstractSpline ): void {

		this.splineDebugService.showBorder( object );

	}

	onUpdated ( spline: AbstractSpline ): void {

		try {

			this.splineDebugService.removeReferenceLine( spline );
			this.splineDebugService.showReferenceLine( spline );

			this.junctionDebugService.findMeshBySpline( spline ).update();

		} catch ( e ) {

			console.error( e );

			Log.error( e );

		}

	}

	onClearHighlight (): void {

		this.highlighted.forEach( road => {

			this.onRemoved( road );

		} )

	}

	onHighlight ( object: AbstractSpline ): void {

		// do nothing

	}

	onDefault ( object: AbstractSpline ): void {

		this.splineDebugService.removeControlPoints( object );
		this.splineDebugService.removeReferenceLine( object );

	}

	onSelected ( object: AbstractSpline ): void {

		this.splineDebugService.showControlPoints( object );
		this.splineDebugService.showReferenceLine( object );

	}

	onUnselected ( object: AbstractSpline ): void {

		this.splineDebugService.removeControlPoints( object );
		this.splineDebugService.removeReferenceLine( object );

	}

	onRemoved ( object: AbstractSpline ): void {

		this.splineDebugService.removeControlPoints( object );
		this.splineDebugService.removeReferenceLine( object );

	}

	clear (): void {

		this.splineDebugService.clear();
		this.highlighted.clear();

	}

}

