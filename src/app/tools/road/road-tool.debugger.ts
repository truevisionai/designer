/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDebugger } from 'app/core/interfaces/base-debugger';
import { AbstractSpline } from 'app/core/shapes/abstract-spline';
import { DebugState } from 'app/services/debug/debug-state';
import { COLOR } from 'app/views/shared/utils/colors.service';
import { SplineDebugService } from "../../services/debug/spline-debug.service";

const LINE_WIDTH = 2.0;

@Injectable( {
	providedIn: 'root'
} )
export class RoadToolDebugger extends BaseDebugger<AbstractSpline> {

	private showBoundingBox = false;

	constructor (
		private splineDebugger: SplineDebugService,
	) {
		super();
	}

	setDebugState ( spline: AbstractSpline, state: DebugState ) {

		if ( !spline ) return;

		this.setBaseState( spline, state );

		this.splineDebugger.setDebugState( spline, state );
	}

	onDefault ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		this.splineDebugger.showBorder( spline );
		// this.splineDebugger.showNodes( spline );

		if ( this.showBoundingBox ) this.splineDebugger.showBoundingBox( spline );

	}

	onHighlight ( spline: AbstractSpline ): void {

		this.splineDebugger.removeBorder( spline );

		if ( spline.controlPoints.length < 2 ) return;

		this.splineDebugger.showBorder( spline );
		this.splineDebugger.showArrows( spline );

		if ( this.showBoundingBox ) this.splineDebugger.showBoundingBox( spline );

	}

	onUnhighlight ( spline: AbstractSpline ) {

		this.splineDebugger.removeArrows( spline );
		this.splineDebugger.removeBorder( spline );

		if ( spline.controlPoints.length < 2 ) return;

		this.splineDebugger.showBorder( spline );

	}

	onSelected ( spline: AbstractSpline ): void {

		if ( spline.controlPoints.length < 2 ) return;

		this.splineDebugger.removeBorder( spline );
		this.splineDebugger.removeArrows( spline );

		this.splineDebugger.showBorder( spline, LINE_WIDTH, COLOR.RED );
		this.splineDebugger.showArrows( spline );
		this.splineDebugger.showReferenceLine( spline );
		this.splineDebugger.showCurvature( spline );
		this.splineDebugger.showPolyline( spline );
		this.splineDebugger.showControlPoints( spline );

		if ( this.showBoundingBox ) this.splineDebugger.showBoundingBox( spline );

	}

	onUnselected ( spline: AbstractSpline ): void {

		this.splineDebugger.removeBorder( spline );
		this.splineDebugger.removeArrows( spline );
		this.splineDebugger.removeReferenceLine( spline );
		this.splineDebugger.removeCurvature( spline );
		this.splineDebugger.removePolyline( spline );
		this.splineDebugger.removeControlPoints( spline );

	}

	onRemoved ( spline: AbstractSpline ) {

		this.splineDebugger.removeBorder( spline );
		this.splineDebugger.removeArrows( spline );
		this.splineDebugger.removeReferenceLine( spline );
		this.splineDebugger.removeCurvature( spline );
		this.splineDebugger.removePolyline( spline );
		this.splineDebugger.removeControlPoints( spline );
		// this.splineDebugger.removeNodes( spline );

		this.highlighted.delete( spline );
		this.selected.delete( spline );

	}

	clear () {

		super.clear();

		this.splineDebugger.clear();

	}

	resetHighlighted () {

		this.highlighted.forEach( spline => this.onDefault( spline ) );

		super.resetHighlighted();

	}

}
