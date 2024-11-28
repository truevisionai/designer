/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseController } from 'app/core/controllers/base-controller';
import { LaneWidthNode } from '../objects/lane-width-node';
import { LaneWidthService } from '../services/lane-width.service';
import { LaneWidthInspector } from '../services/lane-width-node-inspector';

@Injectable()
export class LaneWidthNodeController extends BaseController<LaneWidthNode> {

	constructor ( private laneWidthService: LaneWidthService ) {

		super();

	}

	onAdded ( object: LaneWidthNode ): void {

		this.laneWidthService.addLaneWidth( object.lane.laneSection, object.lane, object.laneWidth );

	}

	onUpdated ( object: LaneWidthNode ): void {

		this.laneWidthService.updateLaneWidth( object.lane.laneSection, object.lane, object.laneWidth );

	}

	onRemoved ( object: LaneWidthNode ): void {

		this.laneWidthService.removeLaneWidth( object.lane.laneSection, object.lane, object.laneWidth );

	}

	showInspector ( object: LaneWidthNode ): void {

		this.setInspector( new LaneWidthInspector( object.point ) );

	}

}
