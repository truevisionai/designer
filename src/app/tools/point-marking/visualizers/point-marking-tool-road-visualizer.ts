/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "../../../map/models/tv-road.model";
import { RoadVisualizer } from "../../../core/visualizers/road-visualizer";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";
import { PointMarkingToolDebugger } from "../point-marking-tool.debugger";

@Injectable( {
	providedIn: 'root'
} )
export class PointMarkingToolRoadVisualizer extends BaseVisualizer<TvRoad> {

	constructor (
		private roadVisualizer: RoadVisualizer,
		private toolDebugger: PointMarkingToolDebugger
	) {
		super();
	}

	onSelected ( road: TvRoad ): void {

		this.toolDebugger.showRoadObjects( road );

		this.roadVisualizer.onSelected( road );

	}

	onUpdated ( road: TvRoad ): void {

		this.roadVisualizer.onUpdated( road );

	}

	onUnselected ( road: TvRoad ): void {

		this.toolDebugger.hideRoadObjects( road );

		this.roadVisualizer.onUnselected( road );

	}

	onRemoved ( road: TvRoad ): void {

		this.toolDebugger.hideRoadObjects( road );

		this.roadVisualizer.onRemoved( road );

	}

	onHighlight ( road: TvRoad ): void {

		this.roadVisualizer.onHighlight( road );

	}

	onDefault ( road: TvRoad ): void {

		this.roadVisualizer.onDefault( road );

	}

	onAdded ( road: TvRoad ): void {

		this.roadVisualizer.onDefault( road );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( road => this.onDefault( road ) );

	}

	clear (): void {

		this.toolDebugger.clear();

		this.roadVisualizer.clear();

	}

}
