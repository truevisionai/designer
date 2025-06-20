/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseVisualizer } from 'app/core/visualizers/base-visualizer';
import { NodeVisualizer } from 'app/core/visualizers/node-visualizer';
import { PropCurve } from 'app/map/prop-curve/prop-curve.model';
import { SplineDebugService } from 'app/services/debug/spline-debug.service';
import { PropCurvePoint } from '../objects/prop-curve-point';

@Injectable()
export class PropCurveVisualizerService extends BaseVisualizer<PropCurve> {

	constructor (
		private splineDebugService: SplineDebugService,
	) {
		super();
	}

	onHighlight ( object: PropCurve ): void {
		//
	}

	onSelected ( object: PropCurve ): void {
		//
	}

	onDefault ( object: PropCurve ): void {
		this.splineDebugService.showPolyline( object.spline );
		this.splineDebugService.showControlPoints( object.spline );
	}

	onUnselected ( object: PropCurve ): void {
		//
	}

	onAdded ( object: PropCurve ): void {
		this.splineDebugService.showPolyline( object.spline );
		this.splineDebugService.showControlPoints( object.spline );
	}

	onUpdated ( object: PropCurve ): void {
		this.splineDebugService.removePolyline( object.spline );
		this.splineDebugService.removeControlPoints( object.spline );

		this.splineDebugService.showPolyline( object.spline );
		this.splineDebugService.showControlPoints( object.spline );
	}

	onRemoved ( object: PropCurve ): void {
		this.splineDebugService.removePolyline( object.spline );
		this.splineDebugService.removeControlPoints( object.spline );
	}

	onClearHighlight (): void {
		this.highlighted.forEach( object => this.onRemoved( object ) );
	}

	clear (): void {
		this.highlighted.clear();
		this.splineDebugService.clear();
	}


}


@Injectable()
export class PropCurvePointVisualizer extends NodeVisualizer<PropCurvePoint> {

	constructor () {
		super();
	}

	onAdded ( object: PropCurvePoint ): void {
		super.onAdded( object );
		this.updateVisuals( object.mainObject );
	}

	onUpdated ( object: PropCurvePoint ): void {
		super.onUpdated( object );
		this.updateVisuals( object.mainObject );
	}

	onRemoved ( object: PropCurvePoint ): void {
		super.onRemoved( object );
		this.updateVisuals( object.mainObject );
	}

	onClearHighlight (): void {
		// this.highlighted.forEach( object => this.onRemoved( object ) );
	}

	clear (): void {
		this.highlighted.clear();
	}

}
