/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "../../../core/overlay-handlers/node-visualizer";
import { LaneWidthLine } from "../objects/lane-width-line";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthLineVisualizer extends NodeVisualizer<LaneWidthLine> {

	onAdded ( object: LaneWidthLine ): void {

		super.onAdded( object );

		this.updateVisuals( object.road );

	}

	onUpdated ( object: LaneWidthLine ): void {

		super.onUpdated( object );

		this.updateVisuals( object.road );

	}

	onRemoved ( object: LaneWidthLine ): void {

		super.onRemoved( object );

		this.updateVisuals( object.road );

	}

}
