/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { ExplicitSpline } from "../../core/shapes/explicit-spline";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { Line } from "three";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { DebugState } from "./debug-state";
import { BaseDebugger } from "../../core/interfaces/base-debugger";

@Injectable( {
	providedIn: 'root'
} )
export class ExplicitSplineHelper extends BaseDebugger<ExplicitSpline> {

	private lines = new Object3DArrayMap<AbstractSpline, Line[]>();

	onDefault ( object: ExplicitSpline ): void {

	}

	onHighlight ( object: ExplicitSpline ): void {

	}

	onRemoved ( object: ExplicitSpline ): void {

		this.lines.removeKey( object );

	}

	onSelected ( object: ExplicitSpline ): void {

		if ( object.controlPoints.length < 2 ) return;

	}

	onUnhighlight ( object: ExplicitSpline ): void {

	}

	onUnselected ( object: ExplicitSpline ): void {

		this.lines.removeKey( object );

	}

	setDebugState ( object: ExplicitSpline, state: DebugState ): void {

		if ( !object ) return;

		this.setBaseState( object, state );

	}

	clear (): void {

		super.clear();

		this.lines.clear();

	}

}

