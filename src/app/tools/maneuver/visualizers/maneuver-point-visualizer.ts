/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { AbstractControlPoint } from "../../../objects/abstract-control-point";
import { PointVisualizer } from "../point-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverPointVisualizer extends PointVisualizer<AbstractControlPoint> {

	protected updateSpline ( object: AbstractControlPoint ): void {
		// do nothing
	}

}
