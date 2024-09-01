import { Injectable } from "@angular/core";
import { CornerControlPoint } from "./crosswalk-tool-debugger";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class CornerPointVisualizer extends NodeVisualizer<CornerControlPoint> {

	onAdded ( object: CornerControlPoint ): void {

		super.onAdded( object );

		this.updateVisuals( object.roadObject );

	}

	onUpdated ( object: CornerControlPoint ): void {

		super.onUpdated( object );

		this.updateVisuals( object.roadObject );

	}

	onRemoved ( object: CornerControlPoint ): void {

		super.onRemoved( object );

		this.updateVisuals( object.roadObject );

	}

}
