/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "../../map/models/tv-lane";
import { LaneService } from "../../services/lane/lane.service";
import { LaneDebugService } from "../../services/debug/lane-debug.service";
import { LaneInspector } from "../../tools/lane/lane-inspector";
import { Injectable } from "@angular/core";
import { BaseObjectHandler } from "./base-object-handler";

@Injectable( {
	providedIn: 'root'
} )
export class LaneObjectHandler extends BaseObjectHandler<TvLane> {

	constructor (
		public laneService: LaneService,
		public laneDebugService: LaneDebugService
	) {
		super();
	}

	onSelected ( object: TvLane ): void {

		this.setInspector( new LaneInspector( object, this.laneService ) );

	}

	onUnselected ( object: TvLane ): void {

		this.clearInspector();

	}

	onAdded ( object: TvLane ): void {

		this.laneService.addLane( object );

	}

	onUpdated ( object: TvLane ): void {

		this.laneService.updateLane( object );

	}

	onRemoved ( object: TvLane ): void {

		this.laneService.removeLane( object );

	}

	onDrag ( object: TvLane ): void {

		// throw new Error( "Method not implemented." );

	}

	onDragEnd ( object: TvLane ): void {

		// throw new Error( "Method not implemented." );

	}



}
