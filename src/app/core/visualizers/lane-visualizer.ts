/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseVisualizer } from "./base-visualizer";
import { LaneDebugService } from "../../services/debug/lane-debug.service";
import { TvLane } from "app/map/models/tv-lane";
import { EmptyVisualizer } from "./empty-visualizer";
import { COLOR } from "app/views/shared/utils/colors.service";

@Injectable( {
	providedIn: 'root'
} )
export class LaneVisualizerWithArrows extends BaseVisualizer<TvLane> {

	constructor ( private laneDebugger: LaneDebugService ) {

		super();

	}

	onAdded ( object: TvLane ): void {

		this.laneDebugger.showLaneOutline( object );

		this.onSelected( object );

	}

	onUpdated ( object: TvLane ): void {

		// do nothing

	}

	onClearHighlight (): void {

		this.highlighted.forEach( lane => {

			this.laneDebugger.removeDirectionalArrows( lane );

			this.highlighted.delete( lane );

		} )

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

	}

	clear (): void {

		this.laneDebugger.clear();

		this.highlighted.clear();

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class LaneVisualizerWithLines extends EmptyVisualizer<TvLane> {

	constructor ( private laneDebugger: LaneDebugService ) {

		super();

	}

	onHighlight ( object: TvLane ): void {

		this.laneDebugger.showLaneOutline( object, 3, COLOR.YELLOW );

	}

	onDefault ( object: TvLane ): void {

		this.laneDebugger.removeLaneOutline( object );
		this.laneDebugger.showLaneOutline( object );

	}

	onSelected ( object: TvLane ): void {

		this.laneDebugger.showLaneOutline( object, 3, COLOR.RED );

	}

	onUnselected ( object: TvLane ): void {

		this.laneDebugger.removeLaneOutline( object );
		this.laneDebugger.showLaneOutline( object );

	}

	clear (): void {

		this.laneDebugger.clear();

		super.clear();

	}

}

