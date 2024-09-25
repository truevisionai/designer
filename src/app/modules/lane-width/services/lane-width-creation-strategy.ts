/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import {
	CreationStrategy,
	ValidationFailed,
	ValidationPassed,
	ValidationResult
} from "../../../core/interfaces/creation-strategy";
import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { LaneWidthNode } from "../objects/lane-width-node";
import { TvRoad } from "app/map/models/tv-road.model";
import { SelectionService } from "../../../tools/selection.service";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { TvLaneWidth } from "app/map/models/tv-lane-width";
import { BaseCreationStrategy } from "app/core/interfaces/base-creation-strategy";

@Injectable()
export class LaneWidthCreationStrategy extends BaseCreationStrategy<LaneWidthNode> {

	constructor (
		private selectionService: SelectionService,
		private roadPositionService: RoadGeometryService,
	) {
		super();
	}

	validate ( event: PointerEventData ): ValidationResult {

		const road = this.selectionService.findSelectedObject<TvRoad>( TvRoad );

		if ( !road ) {
			return new ValidationFailed( 'Select a road to add' );
		}

		const laneCoord = this.roadPositionService.findLaneCoordAt( road, event.point );

		if ( !laneCoord ) {
			return new ValidationFailed( 'Select a valid location on the road' );
		}

		return new ValidationPassed();

	}

	createObject ( event: PointerEventData ): LaneWidthNode {

		const road = this.selectionService.findSelectedObject<TvRoad>( TvRoad );

		if ( !road ) return;

		const laneCoord = this.roadPositionService.findLaneCoordAt( road, event.point );

		if ( !laneCoord ) return;

		const sOffset = laneCoord.s;

		const widthValue = laneCoord.lane.getWidthValue( sOffset ) || 3.2;

		const laneWidth = new TvLaneWidth( sOffset, widthValue, 0, 0, 0, laneCoord.lane );

		return LaneWidthNode.create( laneCoord, laneWidth );

	}

}
