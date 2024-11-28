/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "../../../core/visualizers/node-visualizer";
import { LaneWidthPoint } from "../objects/lane-width-point";

@Injectable()
export class LaneWidthPointVisualizer extends NodeVisualizer<LaneWidthPoint> {

	onAdded ( object: LaneWidthPoint ): void {

		super.onAdded( object );

		this.updateVisuals( object.road );

	}

	onUpdated ( object: LaneWidthPoint ): void {

		super.onUpdated( object );

		this.updateVisuals( object.road );

	}

	onRemoved ( object: LaneWidthPoint ): void {

		super.onRemoved( object );

		this.updateVisuals( object.road );

	}

}
