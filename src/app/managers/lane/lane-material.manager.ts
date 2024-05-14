/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvMaterialService } from "app/graphics/material/tv-material.service";
import { TvLaneType } from "app/map/models/tv-common";
import { TvLane } from "app/map/models/tv-lane";
import { TvLaneSection } from "app/map/models/tv-lane-section";
import { TvRoad } from "app/map/models/tv-road.model";

@Injectable( {
	providedIn: 'root'
} )
export class LaneMaterialManager {

	constructor (
		private materialService: TvMaterialService
	) {
	}

	onLaneCreated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

	}

	onLaneUpdated ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

	}

	onLaneRemoved ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

	}

	onLaneTypeChanged ( road: TvRoad, laneSection: TvLaneSection, lane: TvLane ) {

		// if material is already assigned, do nothing
		if ( lane.threeMaterialGuid ) return;

		if ( lane.type === TvLaneType.sidewalk ) {

			// lane.threeMaterialGuid = this.materialService.getLaneMaterialGuid( 'sidewalk' );

		} else if ( lane.type === TvLaneType.curb ) {

			// lane.threeMaterialGuid = this.materialService.getLaneMaterialGuid( 'curb' );

		}

	}

}
