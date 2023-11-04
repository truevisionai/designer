/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { LaneOffsetNode } from '../../modules/three-js/objects/lane-offset-node';
import { BaseCommand } from '../../commands/base-command';
import { SceneService } from '../../services/scene.service';
import { MapEvents, RoadUpdatedEvent } from 'app/events/map-events';

export class UpdateLaneOffsetValueCommand extends BaseCommand {

	constructor (
		private node: LaneOffsetNode,
		private newOffset: number,
		private oldOffset?: number,
		private laneHelper?: OdLaneReferenceLineBuilder
	) {

		super();

		this.oldOffset = oldOffset || this.node.laneOffset.a;
	}

	execute (): void {

		this.node.updateOffset( this.newOffset );

		this.rebuild( this.node.road );

	}

	undo (): void {

		this.node.updateOffset( this.oldOffset );

		this.rebuild( this.node.road );

	}

	redo (): void {

		this.execute();

	}

	rebuild ( road: TvRoad ): void {

		MapEvents.roadUpdated.emit( new RoadUpdatedEvent( road, false ) );

		this.laneHelper.drawRoad( road, LineType.SOLID, true );

	}

}
