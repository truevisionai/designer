import { EventEmitter, Injectable, Output } from "@angular/core";
import { RoadControlPoint } from "app/modules/three-js/objects/road-control-point";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvMap } from "app/modules/tv-map/models/tv-map.model";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class MapEvents {

	@Output() static mapLoaded = new EventEmitter<TvMap>();
	@Output() static mapRemoved = new EventEmitter<TvMap>();

	@Output() static roadCreated = new EventEmitter<TvRoad>();
	@Output() static roadUpdated = new EventEmitter<TvRoad>();
	@Output() static roadRemoved = new EventEmitter<TvRoad>();

	@Output() static roadControlPointCreated = new EventEmitter<{ road: TvRoad, controlPoint: RoadControlPoint }>();
	@Output() static roadControlPointUpdated = new EventEmitter<{ road: TvRoad, controlPoint: RoadControlPoint }>();
	@Output() static roadControlPointRemoved = new EventEmitter<{ road: TvRoad, controlPoint: RoadControlPoint }>();

	@Output() static laneCreated = new EventEmitter<TvLane>();
	@Output() static laneUpdated = new EventEmitter<TvLane>();
	@Output() static laneRemoved = new EventEmitter<TvLane>();

}
