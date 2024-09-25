/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { LineController } from "../../../core/controllers/line-controller";
import { LaneWidthService } from "../services/lane-width.service";
import { LaneWidthLine } from "../objects/lane-width-line";
import { LaneWidthInspector } from "../services/lane-width-node-inspector";

@Injectable()
export class LaneWidthLineController extends LineController<LaneWidthLine> {

	constructor ( private laneWidthService: LaneWidthService ) {
		super()
	}

	showInspector ( object: LaneWidthLine ): void {

		this.setInspector( new LaneWidthInspector( object ) );

	}

	onAdded ( line: LaneWidthLine ): void {

		this.laneWidthService.addLaneWidth( line.laneSection, line.lane, line.width );

	}

	validate ( object: LaneWidthLine ): void {

		this.laneWidthService.validateLaneWidth( object.road, object.laneSection, object.lane, object.width );

	}

	onUpdated ( line: LaneWidthLine ): void {

		this.laneWidthService.updateLaneWidth( line.laneSection, line.lane, line.width );

	}

	onRemoved ( line: LaneWidthLine ): void {

		this.laneWidthService.removeLaneWidth( line.laneSection, line.lane, line.width );

	}

}
