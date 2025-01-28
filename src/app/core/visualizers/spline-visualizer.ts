/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseVisualizer } from "./base-visualizer";
import { AbstractSpline } from "../shapes/abstract-spline";
import { SplineDebugService } from "../../services/debug/spline-debug.service";
import { SceneService } from "app/services/scene.service";
import { IView } from "app/tools/lane/visualizers/i-view";
import { SplineView } from "app/tools/lane/visualizers/spline.view";
import { ColorUtils } from "app/views/shared/utils/colors.service";

@Injectable( {
	providedIn: 'root'
} )
export abstract class NewSplineVisualizerWithView<T extends AbstractSpline> extends BaseVisualizer<T> {

	private views = new Map<AbstractSpline, IView>();

	// NOTE: this visualizer is not used in the codebase
	constructor (
		private splineDebugService: SplineDebugService,
	) {

		super();

	}

	onAdded ( object: AbstractSpline ): void {

		// this.splineDebugService.showBorder( object );

	}

	onUpdated ( spline: AbstractSpline ): void {

		this.views.get( spline )?.update();

	}

	onClearHighlight (): void { }

	onHighlight ( object: AbstractSpline ): void {

		if ( !this.views.has( object ) ) {

			const node = new SplineView( object );

			this.views.set( object, node );

			SceneService.addToolObject( node );

		}

		this.views.get( object ).onMouseOver();

	}

	onDefault ( object: AbstractSpline ): void {

		this.views.get( object ).onMouseOut();

	}

	onSelected ( object: AbstractSpline ): void {

		this.views.get( object )?.onClick();

	}

	onUnselected ( object: AbstractSpline ): void {

		this.views.get( object )?.onMouseOut();

	}

	onRemoved ( object: AbstractSpline ): void {

		this.views.get( object )?.hide();

	}

	clear (): void {

		this.highlighted.clear();

	}

}

@Injectable( {
	providedIn: 'root'
} )
export abstract class SplineVisualizer<T extends AbstractSpline> extends BaseVisualizer<T> {

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

		this.splineDebugService.showBorder( object, 4, ColorUtils.RED );
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

@Injectable( {
	providedIn: 'root'
} )
export class AutoSplineVisualizer extends SplineVisualizer<AbstractSpline> {

	// NOTE: Need separate visualizer to avoid highlighting bugs

}

@Injectable( {
	providedIn: 'root'
} )
export class ExplicitSplineVisualizer extends SplineVisualizer<AbstractSpline> {

	// NOTE: Need separate visualizer to avoid highlighting bugs

}
