/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseController } from "app/core/controllers/base-controller";
import { PointerEventData } from "app/events/pointer-event-data";
import { TvRoadObject } from "app/map/models/objects/tv-road-object";
import { RoadObjectService } from "app/map/road-object/road-object.service";
import { CrosswalkInspector } from "../crosswalk.inspector";


@Injectable( {
	providedIn: 'root'
} )
export class CrosswalkController extends BaseController<TvRoadObject> {

	constructor ( private roadObjectService: RoadObjectService ) {
		super();
	}

	showInspector ( object: TvRoadObject ): void {
		this.setInspector( new CrosswalkInspector( object, object.markings[ 0 ] ) );
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
