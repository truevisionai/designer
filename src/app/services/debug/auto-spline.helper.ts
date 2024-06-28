/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AutoSplineV2 } from "../../core/shapes/auto-spline-v2";
import { Object3DArrayMap } from "../../core/models/object3d-array-map";
import { AbstractSpline } from "../../core/shapes/abstract-spline";
import { Line } from "three";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { DebugState } from "./debug-state";
import { BaseDebugger } from "../../core/interfaces/base-debugger";
import { Polyline } from "../../objects/polyline";
import { RoundLine } from "../../core/shapes/round-line";

@Injectable( {
	providedIn: 'root'
} )
export class AutoSplineHelper extends BaseDebugger<AutoSplineV2> {

	private lines = new Object3DArrayMap<AbstractSpline, Line[]>();

	private points = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();

	onDefault ( object: AutoSplineV2 ): void {

		// this.polyline = new Polyline( this.controlPoints );
		// this.roundline = new RoundLine( this.controlPoints );

	}

	onHighlight ( object: AutoSplineV2 ): void {

	}

	onRemoved ( object: AutoSplineV2 ): void {

		this.lines.removeKey( object );
		this.points.removeKey( object );

	}

	onSelected ( object: AutoSplineV2 ): void {

		this.points.addItems( object, object.controlPoints );

		if ( object.controlPoints.length < 2 ) return;

		this.lines.addItem( object, this.createPolyline( object )?.mesh )
		this.lines.addItem( object, this.createRoundLine( object )?.mesh );

	}

	onUnhighlight ( object: AutoSplineV2 ): void {

	}

	onUnselected ( object: AutoSplineV2 ): void {

		this.lines.removeKey( object );

		this.points.removeKey( object );

	}

	setDebugState ( object: AutoSplineV2, state: DebugState ): void {

		if ( !object ) return;

		this.lines.addItem( object, this.createPolyline( object )?.mesh )
		this.lines.addItem( object, this.createRoundLine( object )?.mesh );

		this.setBaseState( object, state );

	}

	clear () {

		super.clear();

		this.lines.clear();

		this.points.clear();
	}

	createPolyline ( object: AutoSplineV2 ) {
		return new Polyline( object.controlPoints );
	}

	createRoundLine ( object: AutoSplineV2 ) {
		return new RoundLine( object.controlPoints );
	}
}
