/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointController } from "../../../core/controllers/point-controller";
import { LaneWidthService } from "../lane-width.service";
import { LaneWidthInspector } from "../lane-width-node-inspector";
import { LaneWidthPoint } from "../objects/lane-width-point";

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

}
