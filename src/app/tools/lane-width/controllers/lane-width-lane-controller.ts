/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/object-handlers/empty-controller";
import { TvLane } from "app/map/models/tv-lane";
import { PointerEventData } from "app/events/pointer-event-data";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { TvLaneWidth } from "app/map/models/tv-lane-width";
import { LaneWidthPoint } from "app/tools/lane-width/objects/lane-width-point";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthLaneController extends EmptyController<TvLane> {

	constructor (
		private roadPositionService: RoadGeometryService,
	) {
		super()
	}

	createAt ( lane: TvLane, e: PointerEventData ) {

		const roadCoord = this.roadPositionService.findRoadCoordAt( lane.getRoad(), e.point );

		const sOffset = roadCoord.s - lane.laneSection.s;

		const widthValue = lane.getWidthValue( sOffset ) || 3.2;

		const width = new TvLaneWidth( sOffset, widthValue, 0, 0, 0, lane );

		return new LaneWidthPoint( lane.getRoad(), lane.laneSection, lane, width );

	}

}
