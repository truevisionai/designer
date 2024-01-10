import { Injectable } from "@angular/core";
import { RoadFactory } from "app/factories/road-factory.service";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { MapService } from "app/services/map.service";
import { RoadLinkService } from "app/services/road/road-link.service";

@Injectable( {
	providedIn: 'root'
} )
export class RoadManager {

	constructor (
		private mapService: MapService,
		private linkService: RoadLinkService,
		private roadFactory: RoadFactory,
	) { }

	removeRoad ( road: TvRoad ) {

		this.linkService.removeLinks( road );

		this.mapService.map.removeSpline( road.spline );

		this.roadFactory.idRemoved( road.id );

		this.mapService.map.removeRoad( road );

		this.mapService.map.gameObject.remove( road.gameObject );

	}

}
