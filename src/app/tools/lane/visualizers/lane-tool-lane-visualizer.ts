/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseVisualizer } from "../../../core/visualizers/base-visualizer";
import { LaneDebugService } from "../../../services/debug/lane-debug.service";
import { TvLane } from "app/map/models/tv-lane";

@Injectable( {
	providedIn: 'root'
} )
export class LaneToolLaneVisualizer extends BaseVisualizer<TvLane> {

	constructor ( private laneDebugger: LaneDebugService ) {

		super();

	}

	onAdded ( object: TvLane ): void {

		this.laneDebugger.showLaneOutline( object );

		this.laneDebugger.showDirectionalArrows( object );

		this.updateVisuals( object.getRoad() );

	}

	onUpdated ( object: TvLane ): void {

		this.updateVisuals( object.getRoad() );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( lane => {

			this.laneDebugger.removeDirectionalArrows( lane );

			this.highlighted.delete( lane );

		} );

	}

	onHighlight ( object: TvLane ): void {

		this.laneDebugger.showDirectionalArrows( object );

	}

	onDefault ( object: TvLane ): void {

		this.laneDebugger.removeDirectionalArrows( object );

	}

	onSelected ( object: TvLane ): void {

		this.laneDebugger.showDirectionalArrows( object );

	}

	onUnselected ( object: TvLane ): void {

		this.laneDebugger.removeDirectionalArrows( object );

	}

	onRemoved ( object: TvLane ): void {

		this.laneDebugger.removeLaneOverlay( object );

		this.laneDebugger.removeLaneOutline( object );

		this.laneDebugger.removeDirectionalArrows( object );

		this.updateVisuals( object.getRoad() );

	}

	clear (): void {

		this.laneDebugger.clear();

		this.highlighted.clear();

	}

}
