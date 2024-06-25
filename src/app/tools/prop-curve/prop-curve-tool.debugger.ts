/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDebugger } from "app/core/interfaces/base-debugger";
import { DebugState } from "app/services/debug/debug-state";
import { AbstractSplineDebugService } from "../../services/debug/abstract-spline-debug.service";
import { PropCurve } from "../../map/prop-curve/prop-curve.model";

@Injectable( {
	providedIn: 'root'
} )
export class PropCurveToolDebugger extends BaseDebugger<PropCurve> {

	constructor ( private debug: AbstractSplineDebugService ) {
		super();
	}

	setDebugState ( curve: PropCurve, state: DebugState ): void {

		this.setBaseState( curve, state );

	}

	onDefault ( curve: PropCurve ): void {

		if ( curve.spline ) this.debug.showLines( curve.spline );
		if ( curve.spline ) this.debug.showControlPoints( curve?.spline );

	}

	onHighlight ( curve: PropCurve ): void {

		if ( curve.spline ) this.debug.showLines( curve.spline );
		if ( curve.spline ) this.debug.showControlPoints( curve.spline );

	}

	onRemoved ( curve: PropCurve ): void {

		this.debug.removeLines( curve?.spline );
		this.debug.removeControlPoints( curve?.spline );

		this.debug.hideLines( curve?.spline );
		this.debug.hideControlPoints( curve?.spline );

	}

	onSelected ( curve: PropCurve ): void {

		if ( curve.spline ) this.debug.showLines( curve.spline );
		if ( curve.spline ) this.debug.showControlPoints( curve.spline );

	}

	onUnhighlight ( curve: PropCurve ): void {

		//

	}

	onUnselected ( curve: PropCurve ): void {

		//

	}


}
