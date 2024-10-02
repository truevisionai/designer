/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { EventEmitter, Injectable, Output } from "@angular/core";
import { TvLane } from "app/map/models/tv-lane";
import { TvMap } from "app/map/models/tv-map.model";
import { AbstractControlPoint } from "../objects/abstract-control-point";
import { Asset } from "app/assets/asset.model";
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
import { PropCurve } from "app/map/prop-curve/prop-curve.model";
import { PropPolygon } from "app/map/prop-polygon/prop-polygon.model";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvJunction } from "app/map/models/junctions/tv-junction";
import { Surface } from "app/map/surface/surface.model";
import { RoadObjectAddedEvent, RoadObjectRemovedEvent, RoadObjectUpdatedEvent, RoadSignalAddedEvent, RoadSignalRemovedEvent, RoadSignalUpdatedEvent } from "./road-object.events";

@Injectable( {
	providedIn: 'root'
} )
export class MapEvents {

	@Output() static mapRemoved = new EventEmitter<TvMap>();
	@Output() static mapImported = new EventEmitter<TvMap>();

	@Output() static assetSelected = new EventEmitter<Asset>();
	@Output() static assetDragged = new EventEmitter<Asset>();

	@Output() static objectSelected = new EventEmitter<Object>();
	@Output() static objectUnselected = new EventEmitter<Object>();
	@Output() static objectAdded = new EventEmitter<Object>();
	@Output() static objectUpdated = new EventEmitter<Object>();
	@Output() static objectRemoved = new EventEmitter<Object>();

	@Output() static splineCreated = new EventEmitter<SplineCreatedEvent>();
	@Output() static splineUpdated = new EventEmitter<SplineUpdatedEvent>();
	@Output() static splineRemoved = new EventEmitter<SplineRemovedEvent>();

	@Output() static splineSegmentRemoved = new EventEmitter<SplineUpdatedEvent>();

	@Output() static roadCreated = new EventEmitter<RoadCreatedEvent>();
	@Output() static roadUpdated = new EventEmitter<RoadUpdatedEvent>();
	@Output() static roadRemoved = new EventEmitter<RoadRemovedEvent>();

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
	@Output() static junctionRemoved = new EventEmitter<JunctionRemovedEvent>();
	@Output() static junctionUpdated = new EventEmitter<TvJunction>();

	@Output() static makeMesh = new EventEmitter<any>();
	@Output() static removeMesh = new EventEmitter<any>();

	@Output() static propCurveUpdated = new EventEmitter<PropCurve>();
	@Output() static propCurveRemoved = new EventEmitter<PropCurve>();

	@Output() static propPolygonUpdated = new EventEmitter<PropPolygon>();
	@Output() static propPolygonRemoved = new EventEmitter<PropPolygon>();

	@Output() static surfaceAdded = new EventEmitter<Surface>();
	@Output() static surfaceUpdated = new EventEmitter<Surface>();
	@Output() static surfaceRemoved = new EventEmitter<Surface>();

	@Output() static roadObjectAdded = new EventEmitter<RoadObjectAddedEvent>();
	@Output() static roadObjectUpdated = new EventEmitter<RoadObjectUpdatedEvent>();
	@Output() static roadObjectRemoved = new EventEmitter<RoadObjectRemovedEvent>();

	@Output() static roadSignalAdded = new EventEmitter<RoadSignalAddedEvent>();
	@Output() static roadSignalUpdated = new EventEmitter<RoadSignalUpdatedEvent>();
	@Output() static roadSignalRemoved = new EventEmitter<RoadSignalRemovedEvent>();

}
