/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseDebugService } from "../../core/interfaces/debug.service";
import { DebugState } from "./debug-state";
import { AbstractSplineDebugService } from "./abstract-spline-debug.service";
import { HasSpline } from "../../core/interfaces/data.service";


@Injectable( {
	providedIn: 'root'
} )
export class HasSplineDebugService<T extends HasSpline> extends BaseDebugService<T> {

	constructor ( private debug: AbstractSplineDebugService ) {
		super();
	}

	setDebugState ( object: T, state: DebugState ): void {

		if ( !object ) return;

		this.setBaseState( object, state );
	}

	onDefault ( object: T ): void {

		this.debug.showLines( object.spline );
		this.debug.showControlPoints( object.spline );

	}

	onHighlight ( object: T ): void {

		this.debug.showLines( object.spline );
		this.debug.showControlPoints( object.spline );

	}

	onRemoved ( object: T ): void {

		this.debug.removeLines( object.spline );
		this.debug.removeControlPoints( object.spline );

		this.debug.hideLines( object.spline );
		this.debug.hideControlPoints( object.spline );

	}

	onSelected ( object: T ): void {

		this.debug.showLines( object.spline );
		this.debug.showControlPoints( object.spline );

	}

	onUnhighlight ( object: T ): void {
	}

	onUnselected ( object: T ): void {
	}

}
