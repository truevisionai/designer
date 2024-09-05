/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyVisualizer } from "app/core/visualizers/empty-visualizer";
import { TvRoad } from "app/map/models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class RoadVisualizer extends EmptyVisualizer<TvRoad> {

	onAdded ( object: TvRoad ): void {
		this.updateVisuals( object.spline );
	}

	onUpdated ( object: TvRoad ): void {
		this.updateVisuals( object.spline );
	}

	onRemoved ( object: TvRoad ): void {
		this.updateVisuals( object.spline );
	}

}

