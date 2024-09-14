/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "app/core/visualizers/node-visualizer";
import { PointMarkingControlPoint } from "../objects/point-marking-object";
import { PointMarkingToolDebugger } from "../point-marking-tool.debugger";

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingVisualizer extends NodeVisualizer<PointMarkingControlPoint> {

	constructor ( private toolDebugger: PointMarkingToolDebugger ) {
		super();
	}

	onAdded ( object: PointMarkingControlPoint ): void {

		super.onAdded( object );

		this.toolDebugger.addPoint( object.roadObject, object );

	}

	onRemoved ( object: PointMarkingControlPoint ): void {

		super.onRemoved( object );

		this.toolDebugger.removePoint( object.roadObject, object );

	}

}
