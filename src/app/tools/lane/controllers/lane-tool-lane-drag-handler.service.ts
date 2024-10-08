/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDragHandler } from "../../../core/drag-handlers/base-drag-handler";
import { TvLane } from "../../../map/models/tv-lane";
import { TvLaneCoord } from "../../../map/models/tv-lane-coord";
import { RoadService } from "../../../services/road/road.service";
import { PointerEventData } from "../../../events/pointer-event-data";
import { LaneFactory } from "../../../services/lane/lane.factory";
import { ToolManager } from "../../../managers/tool-manager";
import { Commands } from "../../../commands/commands";
import { Vector3 } from "three";
import { TvLaneWidth } from "../../../map/models/tv-lane-width";

@Injectable( {
	providedIn: 'root'
} )
export class LaneToolLaneDragHandler extends BaseDragHandler<TvLane> {

	private startLaneCoord: TvLaneCoord;

	private newLane: TvLane;

	constructor ( public roadService: RoadService ) {

		super();

	}

	onDragStart ( lane: TvLane, e: PointerEventData ): void {

		this.startLaneCoord = this.startLaneCoord || this.roadService.findLaneCoord( e.point );

		this.newLane = LaneFactory.createDuplicate( lane );

		// lane.getLaneSection().addLaneInstance( this.newLane );

	}

	onDrag ( lane: TvLane, e: PointerEventData ): void {

		this.startLaneCoord = this.startLaneCoord || this.roadService.findLaneCoord( this.dragStartPosition );

		this.updateLaneWidth( this.newLane, this.dragStartPosition, e.point );

		ToolManager.updateVisuals( this.newLane );

	}

	onDragEnd ( object: TvLane, e: PointerEventData ): void {

		Commands.AddObject( this.newLane );

		this.startLaneCoord = this.newLane = null;

	}

	getDragTip ( object: TvLane ): string | null {

		const width = this.calculateLaneWidth( this.startLaneCoord, this.dragStartPosition, this.currentDragPosition );

		return `New Lane Width: ${ width.toFixed( 2 ) }`;

	}

	private updateLaneWidth ( lane: TvLane, start: Vector3, end: Vector3 ): void {

		const width = this.calculateLaneWidth( this.startLaneCoord, start, end );

		lane.width.splice( 0, lane.width.length );

		lane.width.push( new TvLaneWidth( 0, width, 0, 0, 0 ) );

	}

	private calculateLaneWidth ( laneCoord: TvLaneCoord, start: Vector3, end: Vector3 ): number {

		const direction = laneCoord.posTheta.toDirectionVector().normalize();

		// Calculate the vector from startPosition to the current drag point
		const offsetVector = end.clone().sub( start );

		// Calculate the right vector (perpendicular to the lane direction)
		const rightVector = direction.clone().cross( new Vector3( 0, 0, 1 ) ).normalize();

		// Project the toDragPoint vector onto the rightVector to get the lateral distance
		const lateralDistance = offsetVector.dot( rightVector );

		return Math.max( Math.abs( lateralDistance ), 0.1 );
	}

}
