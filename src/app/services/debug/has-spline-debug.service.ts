/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { DebugState } from "./debug-state";
import { HasSpline } from "../../core/interfaces/data.service";
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { SplineDebugService } from "./spline-debug.service";


@Injectable( {
	providedIn: 'root'
} )
export class HasSplineDebugService<T extends HasSpline> extends BaseDebugger<T> {

	constructor ( private debug: SplineDebugService ) {
		super();
	}

	setDebugState ( object: T, state: DebugState ): void {

		if ( !object ) return;

		this.setBaseState( object, state );
	}

	onDefault ( object: T ): void {

		this.debug.showPolyline( object.spline );
		this.debug.showControlPoints( object.spline );

	}

	onHighlight ( object: T ): void {

		this.debug.showPolyline( object.spline );
		this.debug.showControlPoints( object.spline );

	}

	onRemoved ( object: T ): void {

		this.debug.removePolyline( object.spline );
		this.debug.removeControlPoints( object.spline );

	}

	onSelected ( object: T ): void {

		this.debug.removePolyline( object.spline );
		this.debug.removeControlPoints( object.spline );

		this.debug.showPolyline( object.spline );
		this.debug.showControlPoints( object.spline );

	}

	onUnhighlight ( object: T ): void {


	}

	onUnselected ( object: T ): void {

		this.debug.removeControlPoints( object.spline );

	}

}
