/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { BaseVisualizer } from "./base-visualizer";
import { COLOR } from "app/views/shared/utils/colors.service";
import { MapEvents } from "app/events/map-events";
import { LaneDebugService } from "app/services/debug/lane-debug.service";
import { LaneWidthToolDebugger } from "app/tools/lane-width/lane-width-tool.debugger";
import { EmptyVisualizer } from "./empty-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class RoadVisualizer extends BaseVisualizer<TvRoad> {

	constructor ( private roadDebug: RoadDebugService ) {

		super();

		MapEvents.roadUpdated.subscribe( e => {

			if ( this.isEnabled ) this.onUpdated( e.road );

		} );
	}

	onAdded ( object: TvRoad ): void {

		this.onSelected( object );

	}

	onUpdated ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

		this.onSelected( object );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( road => {

			this.onRemoved( road );

		} )

	}

	onHighlight ( object: TvRoad ): void {

		this.roadDebug.showRoadBorderLine( object );

	}

	onDefault ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

	}

	onSelected ( object: TvRoad ): void {

		this.roadDebug.showRoadBorderLine( object, 3, COLOR.RED );

	}

	onUnselected ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

	}

	onRemoved ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

	}

	clear (): void {

		this.roadDebug.clear();

		this.highlighted.clear();

	}

}


@Injectable( {
	providedIn: 'root'
} )
export class RoadVisualizerLaneTool extends RoadVisualizer {

	constructor ( roadDebug: RoadDebugService, private laneDebugger: LaneDebugService ) {

		super( roadDebug );

	}

	override onSelected ( road: TvRoad ): void {

		this.laneDebugger.showLaneOutlines( road.getLaneProfile() );
		this.laneDebugger.showLaneOverlays( road.getLaneProfile() );

		super.onSelected( road );

	}

	override onUpdated ( road: TvRoad ): void {

		this.laneDebugger.removeLaneOutlines( road.getLaneProfile() );
		this.laneDebugger.removeLaneOverlays( road.getLaneProfile() );

		super.onUpdated( road );

	}

	override onUnselected ( road: TvRoad ): void {

		this.laneDebugger.removeLaneOutlines( road.getLaneProfile() );
		this.laneDebugger.removeLaneOverlays( road.getLaneProfile() );

		super.onUnselected( road );

	}

	override onRemoved ( road: TvRoad ): void {

		this.laneDebugger.removeLaneOutlines( road.getLaneProfile() );
		this.laneDebugger.removeLaneOverlays( road.getLaneProfile() );

		super.onRemoved( road );

	}

}


@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthRoadVisualizer extends EmptyVisualizer<TvRoad> {

	constructor ( private baseLaneToolDebugger: RoadVisualizerLaneTool, private widthDebugger: LaneWidthToolDebugger ) {

		super()

	}

	override onSelected ( road: TvRoad ): void {

		this.baseLaneToolDebugger.onSelected( road );

		this.widthDebugger.showRoad( road );

	}

	override onUpdated ( road: TvRoad ): void {

		this.baseLaneToolDebugger.onUpdated( road );

		// this.widthDebugger.showRoad( road );

	}

	override onUnselected ( road: TvRoad ): void {

		this.baseLaneToolDebugger.onUnselected( road );

		this.widthDebugger.hideRoad( road );

	}

	override onRemoved ( road: TvRoad ): void {

		this.baseLaneToolDebugger.onRemoved( road );

		this.widthDebugger.hideRoad( road );

	}

}

