/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AutoSpline } from "../../core/shapes/auto-spline-v2";
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
export class AutoSplineHelper extends BaseDebugger<AutoSpline> {

	private lines = new Object3DArrayMap<AbstractSpline, Line[]>();

	private points = new Object3DArrayMap<AbstractSpline, AbstractControlPoint[]>();

	onDefault ( object: AutoSpline ): void {

		// this.polyline = new Polyline( this.controlPoints );
		// this.roundline = new RoundLine( this.controlPoints );

	}

	onHighlight ( object: AutoSpline ): void {

	}

	onRemoved ( object: AutoSpline ): void {

		this.lines.removeKey( object );
		this.points.removeKey( object );

	}

	onSelected ( object: AutoSpline ): void {

		this.points.addItems( object, object.controlPoints );

		if ( object.controlPoints.length < 2 ) return;

		this.lines.addItem( object, this.createPolyline( object )?.mesh )
		this.lines.addItem( object, this.createRoundLine( object )?.mesh );

	}

	onUnhighlight ( object: AutoSpline ): void {

	}

	onUnselected ( object: AutoSpline ): void {

		this.lines.removeKey( object );

		this.points.removeKey( object );

	}

	setDebugState ( object: AutoSpline, state: DebugState ): void {

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

	createPolyline ( object: AutoSpline ) {
		return new Polyline( object.controlPoints );
	}

	createRoundLine ( object: AutoSpline ) {
		return new RoundLine( object.controlPoints );
	}
}
