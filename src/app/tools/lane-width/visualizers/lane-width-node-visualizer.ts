import { Injectable } from "@angular/core";
import { LaneWidthNode } from "../objects/lane-width-node";
import { EmptyVisualizer } from "app/core/visualizers/empty-visualizer";
import { LaneWidthToolDebugger } from "../lane-width-tool.debugger";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthNodeVisualizer extends EmptyVisualizer<LaneWidthNode> {

	constructor (
		private widthDebugger: LaneWidthToolDebugger,
	) {
		super();
	}

	onAdded ( object: LaneWidthNode ): void {

		this.widthDebugger.addNode( object );

		this.widthDebugger.showRoad( object.road );

	}

	onUpdated ( object: LaneWidthNode ): void {

		this.widthDebugger.showRoad( object.road );

	}

	onRemoved ( object: LaneWidthNode ): void {

		this.widthDebugger.removeNode( object );

		this.widthDebugger.showRoad( object.road );

	}

}
