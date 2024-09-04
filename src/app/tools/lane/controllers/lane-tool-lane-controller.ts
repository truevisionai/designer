/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "../../../map/models/tv-lane";
import { LaneService } from "../../../services/lane/lane.service";
import { LaneInspector } from "../lane-inspector";
import { Injectable } from "@angular/core";
import { BaseController } from "../../../core/controllers/base-controller";

@Injectable( {
	providedIn: 'root'
} )
export class LaneToolLaneController extends BaseController<TvLane> {

	constructor ( public laneService: LaneService ) {
		super();
	}

	showInspector ( object: TvLane ): void {

		this.setInspector( new LaneInspector( object, this.laneService ) );

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

}


