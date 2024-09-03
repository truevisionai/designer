/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "../../../map/models/tv-road.model";
import { LaneWidthToolDebugger } from "../lane-width-tool.debugger";
import { RoadVisualizer } from "../../../core/visualizers/road-visualizer";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthRoadVisualizer extends BaseVisualizer<TvRoad> {


	constructor (
		private widthDebugger: LaneWidthToolDebugger,
		private roadVisualizer: RoadVisualizer,
	) {
		super();
	}

	onHighlight ( object: TvRoad ): void {

		this.roadVisualizer.onHighlight( object );

	}

	onDefault ( object: TvRoad ): void {

		this.roadVisualizer.onDefault( object );

	}

	onAdded ( object: TvRoad ): void {

		this.roadVisualizer.onAdded( object );

	}

	onSelected ( road: TvRoad ): void {

		this.roadVisualizer.onSelected( road );

		this.widthDebugger.showRoad( road );

	}

	onUpdated ( road: TvRoad ): void {

		this.widthDebugger.hideRoad( road );

		this.roadVisualizer.onUpdated( road );

		this.widthDebugger.showRoad( road );

	}

	onUnselected ( road: TvRoad ): void {

		this.roadVisualizer.onUnselected( road );

		this.widthDebugger.hideRoad( road );

	}

	onRemoved ( road: TvRoad ): void {

		this.roadVisualizer.onRemoved( road );

		this.widthDebugger.hideRoad( road );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( road => this.onDefault( road ) );

	}

	clear (): void {

		this.roadVisualizer.clear();

		this.widthDebugger.clear();

	}

}
