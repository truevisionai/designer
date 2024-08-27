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
export class RoadObjectHandler extends BaseObjectHandler<TvRoad> {

	constructor (
		public roadService: RoadService,
		public roadDebugService: RoadDebugService
	) {
		super();
	}

	onSelected ( road: TvRoad ): void {

		this.roadDebugService.showRoadBorderLine( road );

	}

	onUnselected ( road: TvRoad ): void {

		this.roadDebugService.removeRoadBorderLine( road );

	}

	onAdded ( object: TvRoad ): void {

		// throw new Error( "Method not implemented." );

	}

	onUpdated ( object: TvRoad ): void {

		// throw new Error( "Method not implemented." );

	}

	onRemoved ( object: TvRoad ): void {

		// throw new Error( "Method not implemented." );

	}

	onDrag ( object: TvRoad ): void {

		// throw new Error( "Method not implemented." );

	}

	onDragEnd ( object: TvRoad ): void {

		// throw new Error( "Method not implemented." );

	}

}


