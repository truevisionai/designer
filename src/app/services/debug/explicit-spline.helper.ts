/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDebugService } from "../../core/interfaces/debug.service";
import { ExplicitSpline } from "../../core/shapes/explicit-spline";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { Line } from "three";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { DebugState } from "./debug-state";

@Injectable( {
	providedIn: 'root'
} )
export class ExplicitSplineHelper extends BaseDebugService<ExplicitSpline> {

	private lines = new Object3DArrayMap<AbstractSpline, Line[]>();

	private points = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();

	onDefault ( object: ExplicitSpline ): void {

	}

	onHighlight ( object: ExplicitSpline ): void {

	}

	onRemoved ( object: ExplicitSpline ): void {

		this.lines.removeKey( object );

		this.points.removeKey( object );

	}

	onSelected ( object: ExplicitSpline ): void {

		this.points.addItems( object, object.controlPoints );

		if ( object.controlPoints.length < 2 ) return;

		this.lines.addItems( object, object.lines );

	}

	onUnhighlight ( object: ExplicitSpline ): void {

	}

	onUnselected ( object: ExplicitSpline ): void {

		this.lines.removeKey( object );

		this.points.removeKey( object );

	}

	setDebugState ( object: ExplicitSpline, state: DebugState ): void {

		if ( !object ) return;

		object.lines.forEach( line => line.visible = true );

		this.setBaseState( object, state );

	}

}

