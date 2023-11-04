import { EventEmitter, Injectable, Output } from "@angular/core";
import { AbstractSpline } from "app/core/shapes/abstract-spline";
import { TvJunction } from "app/modules/tv-map/models/tv-junction";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvMap } from "app/modules/tv-map/models/tv-map.model";
import { TvRoad } from "app/modules/tv-map/models/tv-road.model";
import { AbstractControlPoint } from "../modules/three-js/objects/abstract-control-point";
import { Object3D } from "three";

export class RoadCreatedEvent {
	constructor ( public road: TvRoad, public showHelpers = true ) { }
}

export class RoadUpdatedEvent {
	constructor ( public road: TvRoad, public showHelpers = true ) { }
}

export class RoadRemovedEvent {
	constructor ( public road: TvRoad, public hideHelpers = true ) { }
}

export class RoadSelectedEvent {
	constructor ( public road: TvRoad ) { }
}

export class RoadUnselectedEvent {
	constructor ( public road: TvRoad ) { }
}

export class RoadControlPointCreatedEvent {
	constructor ( public road: TvRoad, public controlPoint: AbstractControlPoint ) { }
}

export class RoadControlPointUpdatedEvent {
	constructor ( public road: TvRoad, public controlPoint: AbstractControlPoint ) { }
}

export class RoadControlPointRemovedEvent {
	constructor ( public road: TvRoad, public controlPoint: AbstractControlPoint ) { }
}

export class SplineCreatedEvent {
	constructor ( public spline: AbstractSpline ) { }
}

export class SplineUpdatedEvent {
	constructor ( public spline: AbstractSpline ) { }
}

export class SplineRemovedEvent {
	constructor ( public spline: AbstractSpline ) { }
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

	@Output() static objectSelected = new EventEmitter<Object>();
	@Output() static objectUnselected = new EventEmitter<Object>();

	@Output() static objectAdded = new EventEmitter<Object>();
	@Output() static objectRemoved = new EventEmitter<Object>();

	@Output() static roadCreated = new EventEmitter<RoadCreatedEvent>();
	@Output() static roadUpdated = new EventEmitter<RoadUpdatedEvent>();
	@Output() static roadRemoved = new EventEmitter<RoadRemovedEvent>();
	@Output() static roadSelected = new EventEmitter<RoadSelectedEvent>();
	@Output() static roadUnselected = new EventEmitter<RoadUnselectedEvent>();

	@Output() static controlPointSelected = new EventEmitter<AbstractControlPoint>();
	@Output() static controlPointUnselected = new EventEmitter<AbstractControlPoint>();
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
