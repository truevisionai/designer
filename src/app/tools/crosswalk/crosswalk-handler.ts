import { Injectable } from "@angular/core";
import { BaseObjectHandler } from "app/core/object-handlers/base-object-handler";
import { PointerEventData } from "app/events/pointer-event-data";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { RoadObjectService } from "app/map/road-object/road-object.service";


@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkHandler extends BaseObjectHandler<TvRoadObject> {

	constructor ( private roadObjectService: RoadObjectService ) {
		super();
	}

	onAdded ( object: TvRoadObject ): void {
		this.roadObjectService.addRoadObject( object.road, object );
	}

	onUpdated ( object: TvRoadObject ): void {
		this.roadObjectService.updateRoadObject( object.road, object );
	}

	onRemoved ( object: TvRoadObject ): void {
		this.roadObjectService.removeRoadObject( object.road, object );
	}

	onDrag ( object: TvRoadObject, e: PointerEventData ): void {
		//
	}

	onDragEnd ( object: TvRoadObject, e: PointerEventData ): void {
		//
	}

}
