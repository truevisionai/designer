/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "../../../map/models/tv-road.model";
import { RoadVisualizer } from "../../../core/visualizers/road-visualizer";
import { CrosswalkToolDebugger } from "../crosswalk-tool-debugger";
import { TvRoadObjectType } from "app/map/models/objects/tv-road-object";
import { BaseVisualizer } from "app/core/visualizers/base-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkToolRoadVisualizer extends BaseVisualizer<TvRoad> {

	constructor (
		private crosswalkDebugService: CrosswalkToolDebugger,
		private roadVisualizer: RoadVisualizer,
	) {
		super();
	}

	onHighlight ( object: TvRoad ): void {

		this.roadVisualizer.onHighlight( object );

	}
	onSelected ( object: TvRoad ): void {

		this.roadVisualizer.onSelected( object );

		this.showCrosswalks( object );

	}

	onDefault ( object: TvRoad ): void {

		this.roadVisualizer.onDefault( object );

		this.crosswalkDebugService.removeAll( object );

	}

	onUnselected ( object: TvRoad ): void {

		this.roadVisualizer.onUnselected( object );

		this.crosswalkDebugService.removeAll( object );

	}

	onAdded ( object: TvRoad ): void {

		this.roadVisualizer.onAdded( object );

		this.showCrosswalks( object );

	}

	onUpdated ( object: TvRoad ): void {

		this.roadVisualizer.onUpdated( object );

		this.showCrosswalks( object );

	}

	onRemoved ( object: TvRoad ): void {

		this.roadVisualizer.onRemoved( object );

		this.crosswalkDebugService.removeAll( object );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( road => this.onDefault( road ) );
	}

	clear (): void {

		this.roadVisualizer.clear();

		this.crosswalkDebugService.clear();

	}

	private showCrosswalks ( road: TvRoad ): void {

		road.getRoadObjects()
			.filter( roadObject => roadObject.attr_type == TvRoadObjectType.crosswalk )
			.forEach( roadObject => this.crosswalkDebugService.addGizmo( road, roadObject ) );

	}

}


