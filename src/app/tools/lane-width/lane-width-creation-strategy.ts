import { CreationStrategy, ValidationFailed, ValidationPassed, ValidationResult } from "../../core/interfaces/creation-strategy";
import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { LaneWidthNode } from "./objects/lane-width-node";
import { TvRoad } from "app/map/models/tv-road.model";
import { SelectionService } from "../selection.service";
import { RoadGeometryService } from "app/services/road/road-geometry.service";
import { TvLaneWidth } from "app/map/models/tv-lane-width";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthCreationStrategy implements CreationStrategy<LaneWidthNode> {

	constructor (
		private selectionService: SelectionService,
		private roadPositionService: RoadGeometryService,
	) { }

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

		const sOffset = laneCoord.s - laneCoord.laneSection.s;

		const widthValue = laneCoord.lane.getWidthValue( sOffset ) || 3.2;

		const laneWidth = new TvLaneWidth( sOffset, widthValue, 0, 0, 0, laneCoord.lane );

		return LaneWidthNode.create( laneCoord, laneWidth );

	}

}
