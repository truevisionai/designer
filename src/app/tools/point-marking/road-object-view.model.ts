import { BaseViewModel } from "../lane/visualizers/i-view-model";
import { TvRoadObject } from "../../map/models/objects/tv-road-object";
import { PointView } from "../lane/visualizers/point.view";
import { MapEvents } from "../../events/map-events";
import { RoadObjectRemovedEvent, RoadObjectUpdatedEvent } from "../../events/road-object.events";
import { RoadObjectViewModelInspector } from "./point-marking.inspector";
import { PointerEventData } from "../../events/pointer-event-data";
import { AppInspector } from "../../core/inspector";

export class RoadObjectViewModel extends BaseViewModel<TvRoadObject, PointView> {

	constructor ( public object: TvRoadObject ) {

		super( PointView.create( object.getObjectPosition().toVector3() ) );

	}

	render (): void {

		super.render();

		this.object.road.addRoadObject( this.object );

		MapEvents.roadObjectAdded.emit( { road: this.object.road, roadObject: this.object } );

	}

	update (): void {

		this.view.setPosition( this.object.getObjectPosition().toVector3() );

		MapEvents.roadObjectUpdated.emit( new RoadObjectUpdatedEvent( this.object.road, this.object ) );

	}

	onViewUpdated (): void {

		const coord = this.object.road.getRoadCoordinatesAt( this.view.getPosition() );

		this.object.updateRoadCoordinates( coord.s, coord.t );

		this.view.setPosition( coord.position );

		MapEvents.roadObjectUpdated.emit( new RoadObjectUpdatedEvent( this.object.road, this.object ) );

	}

	remove (): void {

		super.remove();

		this.object.road.removeRoadObject( this.object );

		MapEvents.roadObjectRemoved.emit( new RoadObjectRemovedEvent( this.object.road, this.object ) );

	}

	onDrag ( data: PointerEventData ): void {

		if ( !this.object.road.isPointOnRoad( data.point ) ) return;

		const coord = this.object.road.getRoadCoordinatesAt( data.point );

		this.object.updateRoadCoordinates( coord.s, coord.t );

		this.view.setPosition( data.point );

		MapEvents.roadObjectUpdated.emit( new RoadObjectUpdatedEvent( this.object.road, this.object ) );

	}

	override onSelect (): void {

		AppInspector.setDynamicInspector( new RoadObjectViewModelInspector( this ) );

		super.onSelect();

	}

}
