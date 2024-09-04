/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { LaneDebugService } from "../../../services/debug/lane-debug.service";
import { TvRoad } from "../../../map/models/tv-road.model";
import { RoadVisualizer } from "../../../core/visualizers/road-visualizer";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class LaneToolRoadVisualizer extends BaseVisualizer<TvRoad> {


	constructor ( private roadVisualizer: RoadVisualizer, private laneDebugger: LaneDebugService ) {
		super();
	}

	onSelected ( road: TvRoad ): void {

		this.laneDebugger.showLaneOutlines( road.getLaneProfile() );

		this.roadVisualizer.onSelected( road );

	}

	onUpdated ( road: TvRoad ): void {

		this.laneDebugger.removeLaneOutlines( road.getLaneProfile() );

		this.laneDebugger.showLaneOutlines( road.getLaneProfile() );

		this.roadVisualizer.onUpdated( road );

	}

	onUnselected ( road: TvRoad ): void {

		this.laneDebugger.removeLaneOutlines( road.getLaneProfile() );

		this.roadVisualizer.onUnselected( road );

	}

	onRemoved ( road: TvRoad ): void {

		this.laneDebugger.removeLaneOutlines( road.getLaneProfile() );

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

		this.laneDebugger.clear();

		this.roadVisualizer.clear();

	}

}
