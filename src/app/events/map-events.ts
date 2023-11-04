import { EventEmitter, Injectable, Output } from "@angular/core";
import { RoadControlPoint } from "app/modules/three-js/objects/road-control-point";
import { TvJunction } from "app/modules/tv-map/models/tv-junction";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvMap } from "app/modules/tv-map/models/tv-map.model";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";

export class RoadCreatedEvent {
	constructor ( public road: TvRoad, public showHelpers = true ) { }
}

export class RoadUpdatedEvent {
	constructor ( public road: TvRoad, public showHelpers = true ) { }
}

export class RoadRemovedEvent {
	constructor ( public road: TvRoad, public hideHelpers = true ) { }
}

export interface RoadControlPointCreatedEvent {
	road: TvRoad;
	controlPoint: RoadControlPoint;
}

export interface RoadControlPointUpdatedEvent {
	road: TvRoad;
	controlPoint: RoadControlPoint;
}

export interface RoadControlPointRemovedEvent {
	road: TvRoad;
	controlPoint: RoadControlPoint;
}

export interface LaneCreatedEvent {
	lane: TvLane;
}

export interface LaneUpdatedEvent {
	lane: TvLane;
}

export interface LaneRemovedEvent {
	lane: TvLane;
}


export class JunctionCreatedEvent {
	constructor ( public junction: TvJunction ) { }
}

export class JunctionUpdatedEvent {
	constructor ( public junction: TvJunction ) { }
}

export class JunctionRemovedEvent {
	constructor ( public junction: TvJunction ) { }
}

@Injectable( {
	providedIn: 'root'
} )
export class MapEvents {

	@Output() static mapLoaded = new EventEmitter<TvMap>();
	@Output() static mapRemoved = new EventEmitter<TvMap>();

	@Output() static roadCreated = new EventEmitter<RoadCreatedEvent>();
	@Output() static roadUpdated = new EventEmitter<RoadUpdatedEvent>();
	@Output() static roadRemoved = new EventEmitter<RoadRemovedEvent>();

	@Output() static roadControlPointCreated = new EventEmitter<RoadControlPointCreatedEvent>();
	@Output() static roadControlPointUpdated = new EventEmitter<RoadControlPointUpdatedEvent>();
	@Output() static roadControlPointRemoved = new EventEmitter<RoadControlPointRemovedEvent>();

	@Output() static laneCreated = new EventEmitter<TvLane>();
	@Output() static laneUpdated = new EventEmitter<TvLane>();
	@Output() static laneRemoved = new EventEmitter<TvLane>();

	@Output() static junctionCreated = new EventEmitter<JunctionCreatedEvent>();
	@Output() static junctionUpdated = new EventEmitter<JunctionUpdatedEvent>();
	@Output() static junctionRemoved = new EventEmitter<JunctionRemovedEvent>();


}
