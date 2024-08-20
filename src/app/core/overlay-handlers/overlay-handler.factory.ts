/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable, Injector } from "@angular/core";
import { TvRoad } from "../../map/models/tv-road.model";
import { RoadOverlayHandler } from "./road-overlay-handler";
import { OverlayHandler } from "./overlay-handler";

@Injectable( {
	providedIn: 'root'
} )
export class OverlayHandlerFactory {

	constructor (
		private injector: Injector
	) {
	}

	createRoadHandler (): OverlayHandler<TvRoad> {

		return this.injector.get( RoadOverlayHandler );

	}

}
