/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { CornerControlPoint } from "../objects/corner-control-point";
import { CrosswalkToolDebugger } from "../crosswalk-tool-debugger";

@Injectable( {
	providedIn: 'root'
} )
export class CornerPointVisualizer extends NodeVisualizer<CornerControlPoint> {

	constructor ( private crosswalkDebugService: CrosswalkToolDebugger ) {
		super();
	}

	onAdded ( object: CornerControlPoint ): void {

		super.onAdded( object );

		this.crosswalkDebugService.addPoint( object.roadObject, object );

		this.crosswalkDebugService.updateGizmo( object.road, object.roadObject );

	}

	onUpdated ( object: CornerControlPoint ): void {

		super.onUpdated( object );

		this.crosswalkDebugService.updateGizmo( object.road, object.roadObject );

	}

	onRemoved ( object: CornerControlPoint ): void {

		super.onRemoved( object );

		this.crosswalkDebugService.removePoint( object.roadObject, object );

		this.crosswalkDebugService.updateGizmo( object.road, object.roadObject );

	}

}
