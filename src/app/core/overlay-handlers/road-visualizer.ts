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

@Injectable( {
	providedIn: 'root'
} )
export class RoadVisualizer extends BaseVisualizer<TvRoad> {

	constructor ( private roadDebug: RoadDebugService, protected laneDebugger: LaneDebugService ) {

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

		this.laneDebugger.showLaneOverlays( object.getLaneProfile() );

	}

	onUnselected ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

		this.laneDebugger.removeLaneOverlays( object.getLaneProfile() );

	}

	onRemoved ( object: TvRoad ): void {

		this.roadDebug.removeRoadBorderLine( object );

		this.laneDebugger.removeLaneOverlays( object.getLaneProfile() );

	}

	clear (): void {

		this.roadDebug.clear();

		this.highlighted.clear();

		this.laneDebugger.clear();

	}

}


