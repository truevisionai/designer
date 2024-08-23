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

		this.selected.add( object );

	}

	onUnselected ( object: TvLane ): void {

		this.clearInspector();

		this.selected.delete( object );

	}

	onAdded ( object: TvLane ): void {

		this.laneService.addLane( object );

		this.onSelected( object );

	}

	onUpdated ( object: TvLane ): void {

		this.laneService.updateLane( object );

		this.onSelected( object );

	}

	onRemoved ( object: TvLane ): void {

		this.laneService.removeLane( object );

		this.onUnselected( object );

	}

}
