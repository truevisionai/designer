import { Injectable } from "@angular/core";
import { RoadDebugService } from "../../services/debug/road-debug.service";
import { LaneDebugService } from "../../services/debug/lane-debug.service";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadOverlayHandler } from "./road-overlay-handler";
import { MapEvents } from "app/events/map-events";

@Injectable( {
	providedIn: 'root'
} )
export class LaneToolOverlayHandler extends RoadOverlayHandler {

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

	override onRemoved ( road: TvRoad ): void {

		this.laneDebugger.removeLaneOutlines( road.getLaneProfile() );
		this.laneDebugger.removeLaneOverlays( road.getLaneProfile() );

		super.onRemoved( road );

	}

}
