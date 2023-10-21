/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { LaneWidthNode } from '../../../modules/three-js/objects/lane-width-node';
import { BaseCommand } from '../../commands/base-command';
import { NodeFactoryService } from '../../factories/node-factory.service';
import { MapEvents } from 'app/events/map-events';

export class UpdateWidthNodeValueCommand extends BaseCommand {


	constructor (
		private node: LaneWidthNode,
		private newWidth: number,
		private readonly oldWidth: number,
		private laneHelper: OdLaneReferenceLineBuilder
	) {

		super();

		this.oldWidth = oldWidth || this.node.laneWidth.a;
	}

	execute (): void {

		this.node.laneWidth.a = this.newWidth;

		this.node.updateLaneWidthValues();

		NodeFactoryService.updateLaneWidthNodeLine( this.node );

		this.rebuild( this.node.road );

	}

	undo (): void {

		this.node.laneWidth.a = this.oldWidth;

		this.node.updateLaneWidthValues();

		NodeFactoryService.updateLaneWidthNodeLine( this.node );

		this.rebuild( this.node.road );

	}

	redo (): void {

		this.execute();

	}

	rebuild ( road: TvRoad ): void {

		MapEvents.laneUpdated.emit( this.node.lane );

		this.laneHelper.drawRoad( road, LineType.SOLID, true );

	}

}
