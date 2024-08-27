/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseOverlayHandler } from "./base-overlay-handler";
import { AbstractSpline } from "../shapes/abstract-spline";
import { SplineDebugService } from "../../services/debug/spline-debug.service";
import { COLOR } from "../../views/shared/utils/colors.service";

@Injectable( {
	providedIn: 'root'
} )
export class SplineOverlayHandler extends BaseOverlayHandler<AbstractSpline> {

	constructor (
		private splineDebugService: SplineDebugService,
	) {

		super();

	}

	onAdded ( object: AbstractSpline ): void {

		this.splineDebugService.showBorder( object );

	}

	onUpdated ( spline: AbstractSpline ): void {

		this.splineDebugService.removeBorder( spline );
		this.splineDebugService.removeControlPoints( spline );
		this.splineDebugService.removePolyline( spline );
		this.splineDebugService.removeReferenceLine( spline );
		this.splineDebugService.removeCurvature( spline );

		this.splineDebugService.showBorder( spline );
		this.splineDebugService.showControlPoints( spline );
		this.splineDebugService.showPolyline( spline );
		this.splineDebugService.showReferenceLine( spline );
		this.splineDebugService.showCurvature( spline );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( road => {

			this.onRemoved( road );

		} )

	}

	onHighlight ( object: AbstractSpline ): void {

		this.splineDebugService.showBorder( object );

	}

	onDefault ( object: AbstractSpline ): void {

		this.splineDebugService.removeBorder( object );
		this.splineDebugService.removeControlPoints( object );
		this.splineDebugService.removePolyline( object );
		this.splineDebugService.removeReferenceLine( object );
		this.splineDebugService.removeCurvature( object );

	}

	onSelected ( object: AbstractSpline ): void {

		this.splineDebugService.showBorder( object, 4, COLOR.RED );
		this.splineDebugService.showControlPoints( object );
		this.splineDebugService.showPolyline( object );
		this.splineDebugService.showReferenceLine( object );
		this.splineDebugService.showCurvature( object );

	}

	onUnselected ( object: AbstractSpline ): void {

		this.splineDebugService.removeBorder( object );
		this.splineDebugService.removeControlPoints( object );
		this.splineDebugService.removePolyline( object );
		this.splineDebugService.removeReferenceLine( object );
		this.splineDebugService.removeCurvature( object );

	}

	onRemoved ( object: AbstractSpline ): void {

		this.splineDebugService.removeBorder( object );
		this.splineDebugService.removeControlPoints( object );
		this.splineDebugService.removePolyline( object );
		this.splineDebugService.removeReferenceLine( object );
		this.splineDebugService.removeCurvature( object );

	}

	clear (): void {

		this.splineDebugService.clear();
		this.highlighted.clear();

	}

}
