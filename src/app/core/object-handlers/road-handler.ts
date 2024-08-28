/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { RoadService } from "app/services/road/road.service";
import { RoadDebugService } from "app/services/debug/road-debug.service";
import { TvRoad } from "app/map/models/tv-road.model";
import { Injectable } from "@angular/core";
import { BaseObjectHandler } from "./base-object-handler";

@Injectable( {
	providedIn: 'root'
} )
export class RoadHandler extends BaseObjectHandler<TvRoad> {

	constructor (
		public roadService: RoadService,
		public roadDebugService: RoadDebugService
	) {
		super();
	}

	onSelected ( road: TvRoad ): void {

		// TODO: implement this

	}

	onUnselected ( road: TvRoad ): void {

		// TODO: implement this

	}

	onAdded ( object: TvRoad ): void {

		// TODO: implement this

	}

	onUpdated ( object: TvRoad ): void {

		// TODO: implement this

	}

	onRemoved ( object: TvRoad ): void {

		// TODO: implement this

	}

	onDrag ( object: TvRoad ): void {

		// TODO: implement this

	}

	onDragEnd ( object: TvRoad ): void {

		// TODO: implement this

	}

}


