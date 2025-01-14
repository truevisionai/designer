/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { Commands } from "app/commands/commands";
import { PointDragHandler } from "app/core/drag-handlers/point-drag-handler.service";
import { PointerEventData } from "app/events/pointer-event-data";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { LanePositionService } from "app/services/lane/lane-position.service";
import { Vector3 } from "app/core/maths"
import { LaneWidthService } from "../services/lane-width.service";
import { LaneWidthPoint } from "../objects/lane-width-point";


@Injectable()
export class LaneWidthPointDragHandler extends PointDragHandler<LaneWidthPoint> {

	private originalWidth: number;

	constructor ( private laneWidthService: LaneWidthService ) {
		super();
	}

	onDragStart ( object: LaneWidthPoint, e: PointerEventData ): void {
		// throw new Error( "Method not implemented." );
	}

	onDrag ( node: LaneWidthPoint, e: PointerEventData ): void {

		this.originalWidth = this.originalWidth || node.width.a;

		const laneCoord = LanePositionService.instance.findLaneStartPosition( node.road, node.laneSection, node.lane, node.width.s );

		const width = this.calculateLaneWidth( laneCoord, e.point );

		node.width.a = width;

		this.laneWidthService.updateCoefficients( node.lane );

	}

	onDragEnd ( node: LaneWidthPoint, e: PointerEventData ): void {

		const laneCoord = LanePositionService.instance.findLaneStartPosition( node.road, node.laneSection, node.lane, node.width.s );

		const width = this.calculateLaneWidth( laneCoord, e.point );

		Commands.SetValue( node, 'a', width, this.originalWidth );

		this.originalWidth = undefined;

	}

	getDragTip ( object: LaneWidthPoint ): string | null {

		return `Width: ${ object.width.a.toFixed( 2 ) }`;

	}

	private calculateLaneWidth ( startPosition: TvPosTheta, currentPosition: Vector3 ): number {

		const direction = startPosition.toDirectionVector().normalize();

		// Calculate the vector from startPosition to the current drag point
		const offsetVector = currentPosition.clone().sub( startPosition.position );

		// Calculate the right vector (perpendicular to the lane direction)
		const rightVector = direction.clone().cross( new Vector3( 0, 0, 1 ) ).normalize();

		// Project the toDragPoint vector onto the rightVector to get the lateral distance
		const lateralDistance = offsetVector.dot( rightVector );

		// You can return the lane width or store it as needed
		return Math.max( Math.abs( lateralDistance ), 0.1 );

	}

}
