import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { TvRoad } from "app/map/models/tv-road.model";
import { TvRoadSignal } from "app/map/road-signal/tv-road-signal.model";

export class RoadObjectAddedEvent {
	constructor ( public road: TvRoad, public roadObject: TvRoadObject ) {
	}
}

export class RoadObjectUpdatedEvent extends RoadObjectAddedEvent {
}

export class RoadObjectRemovedEvent extends RoadObjectAddedEvent {
}



export class RoadSignalAddedEvent {
	constructor ( public road: TvRoad, public roadSignal: TvRoadSignal ) {
	}
}

export class RoadSignalUpdatedEvent extends RoadSignalAddedEvent {
}

export class RoadSignalRemovedEvent extends RoadSignalAddedEvent {
}
