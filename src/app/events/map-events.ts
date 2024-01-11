import { EventEmitter, Injectable, Output } from "@angular/core";
import { TvLane } from "app/modules/tv-map/models/tv-lane";
import { TvMap } from "app/modules/tv-map/models/tv-map.model";
import { AbstractControlPoint } from "../modules/three-js/objects/abstract-control-point";
import { AssetNode } from "app/views/editor/project-browser/file-node.model";
import { RoadCreatedEvent } from "./road/road-created-event";
import { RoadUpdatedEvent } from "./road/road-updated-event";
import { RoadRemovedEvent } from "./road/road-removed-event";
import { RoadSelectedEvent } from "./road/road-selected-event";
import { RoadUnselectedEvent } from "./road/road-unselected-event";
import { ControlPointCreatedEvent } from "./control-point-created-event";
import { ControlPointUpdatedEvent } from "./control-point-updated-event";
import { ControlPointRemovedEvent } from "./control-point-removed-event";
import { SplineCreatedEvent } from "./spline/spline-created-event";
import { SplineUpdatedEvent } from "./spline/spline-updated-event";
import { SplineRemovedEvent } from "./spline/spline-removed-event";
import { JunctionCreatedEvent } from "./junction/junction-created-event";
import { JunctionUpdatedEvent } from "./junction/junction-updated-event";
import { JunctionRemovedEvent } from "./junction/junction-removed-event";
import { LaneTypeChangedEvent } from "./lane/lane-type-changed.event";

@Injectable( {
	providedIn: 'root'
} )
export class MapEvents {

	@Output() static mapLoaded = new EventEmitter<TvMap>();
	@Output() static mapRemoved = new EventEmitter<TvMap>();

	@Output() static assetSelected = new EventEmitter<AssetNode>();

	@Output() static objectSelected = new EventEmitter<Object>();
	@Output() static objectUnselected = new EventEmitter<Object>();
	@Output() static objectAdded = new EventEmitter<Object>();
	@Output() static objectUpdated = new EventEmitter<Object>();
	@Output() static objectRemoved = new EventEmitter<Object>();

	@Output() static splineCreated = new EventEmitter<SplineCreatedEvent>();
	@Output() static splineUpdated = new EventEmitter<SplineUpdatedEvent>();
	@Output() static splineRemoved = new EventEmitter<SplineRemovedEvent>();

	@Output() static roadCreated = new EventEmitter<RoadCreatedEvent>();
	@Output() static roadUpdated = new EventEmitter<RoadUpdatedEvent>();
	@Output() static roadRemoved = new EventEmitter<RoadRemovedEvent>();
	@Output() static roadSelected = new EventEmitter<RoadSelectedEvent>();
	@Output() static roadUnselected = new EventEmitter<RoadUnselectedEvent>();

	@Output() static controlPointSelected = new EventEmitter<AbstractControlPoint>();
	@Output() static controlPointUnselected = new EventEmitter<AbstractControlPoint>();

	@Output() static controlPointCreated = new EventEmitter<ControlPointCreatedEvent>();
	@Output() static controlPointUpdated = new EventEmitter<ControlPointUpdatedEvent>();
	@Output() static controlPointRemoved = new EventEmitter<ControlPointRemovedEvent>();

	@Output() static laneCreated = new EventEmitter<TvLane>();
	@Output() static laneTypeChanged = new EventEmitter<LaneTypeChangedEvent>();
	@Output() static laneUpdated = new EventEmitter<TvLane>();
	@Output() static laneRemoved = new EventEmitter<TvLane>();

	@Output() static junctionCreated = new EventEmitter<JunctionCreatedEvent>();
	@Output() static junctionUpdated = new EventEmitter<JunctionUpdatedEvent>();
	@Output() static junctionRemoved = new EventEmitter<JunctionRemovedEvent>();

}
