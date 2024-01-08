import { Injectable } from "@angular/core";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { MapService } from "app/services/map.service";
import { RoadLinkService } from "app/services/road/road-link.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadManager {

	constructor (
		private mapService: MapService,
		private roadLinkManager: RoadLinkService,
	) { }

	removeRoad ( road: TvRoad ) {

		this.roadLinkManager.removeLinks( road );

		this.mapService.map.removeRoad( road );

	}

}
