/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointController } from "../../../core/controllers/point-controller";
import { LaneWidthService } from "../lane-width.service";
import { LaneWidthInspector } from "../lane-width-node-inspector";
import { PointerEventData } from "../../../events/pointer-event-data";
import { LaneWidthPoint } from "../objects/lane-width-point";
import { Vector3 } from "three";
import { LanePositionService } from "app/services/lane/lane-position.service";
import { TvPosTheta } from "app/map/models/tv-pos-theta";
import { Commands } from "app/commands/commands";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthPointController extends PointController<LaneWidthPoint> {

	constructor ( private laneWidthService: LaneWidthService ) {
		super();
	}

	showInspector ( object: LaneWidthPoint ): void {

		this.setInspector( new LaneWidthInspector( object ) );

	}

	onAdded ( object: LaneWidthPoint ): void {

		this.laneWidthService.addLaneWidth( object.laneSection, object.lane, object.width );

	}

	validate ( object: LaneWidthPoint ): void {

		this.laneWidthService.validateLaneWidth( object.road, object.laneSection, object.lane, object.width );

	}

	onUpdated ( node: LaneWidthPoint ): void {

		this.laneWidthService.updateLaneWidth( node.laneSection, node.lane, node.width );

	}

	onRemoved ( object: LaneWidthPoint ): void {

		this.laneWidthService.removeLaneWidth( object.laneSection, object.lane, object.width );

	}

	private originalWidth: number;

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
