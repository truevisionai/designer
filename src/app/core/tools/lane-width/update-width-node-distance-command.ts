/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvMapBuilder } from 'app/modules/tv-map/builders/tv-map-builder';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { LaneWidthNode } from '../../../modules/three-js/objects/lane-width-node';
import { NodeFactoryService } from '../../factories/node-factory.service';
import { SceneService } from '../../services/scene.service';
import { BaseCommand } from '../../commands/base-command';

export class UpdateWidthNodeDistanceCommand extends BaseCommand {

	constructor (
		private node: LaneWidthNode,
		private newDistance: number,
		private oldDistance?: number,
		private laneHelper?: OdLaneReferenceLineBuilder
	) {

		super();

		this.oldDistance = oldDistance || this.node.laneWidth.s;

	}

	execute (): void {

		this.node.laneWidth.s = this.newDistance;

		this.node.updateLaneWidthValues();

		NodeFactoryService.updateLaneWidthNodeLine( this.node );

		this.rebuild( this.node.road );


	}

	undo (): void {

		this.node.laneWidth.s = this.oldDistance;

		this.node.updateLaneWidthValues();

		NodeFactoryService.updateLaneWidthNodeLine( this.node );

		this.rebuild( this.node.road );

	}

	redo (): void {

		this.execute();

	}

	rebuild ( road: TvRoad ): void {

		SceneService.removeWithChildren( road.gameObject, true );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

		this.laneHelper.drawRoad( road, LineType.SOLID, true );

	}

}
