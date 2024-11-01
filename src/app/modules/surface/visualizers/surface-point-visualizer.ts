/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "../../../core/visualizers/node-visualizer";
import { SimpleControlPoint } from "../../../objects/simple-control-point";
import { Surface } from "../../../map/surface/surface.model";

@Injectable()
export class SurfacePointVisualizer extends NodeVisualizer<SimpleControlPoint<Surface>> {

	constructor () {
		super();
	}

	onAdded ( object: SimpleControlPoint<Surface> ): void {
		super.onAdded( object );
		this.updateVisuals( object.mainObject );
	}

	onUpdated ( object: SimpleControlPoint<Surface> ): void {
		super.onUpdated( object );
		this.updateVisuals( object.mainObject );
	}

	onRemoved ( object: SimpleControlPoint<Surface> ): void {
		super.onRemoved( object );
		this.updateVisuals( object.mainObject );
	}

	onClearHighlight (): void {
		// this.highlighted.forEach( object => this.onRemoved( object ) );
	}

	clear (): void {
		this.highlighted.clear();
	}

}
