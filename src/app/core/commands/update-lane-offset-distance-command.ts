/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneOffsetNode } from 'app/modules/three-js/objects/control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { NodeFactoryService } from '../factories/node-factory.service';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';

export class UpdateLaneOffsetDistanceCommand extends BaseCommand {

	constructor (
		private node: LaneOffsetNode,
		private newDistance: number,
		private oldDistance?: number,
		private laneHelper?: OdLaneReferenceLineBuilder
	) {

		super();

		if ( !this.oldDistance ) {

			this.oldDistance = this.node.laneOffset.s;

		}

	}

	execute (): void {

		this.node.laneOffset.s = this.newDistance;

		NodeFactoryService.updateLaneOffsetNode( this.node );

		this.rebuild( this.node.road );


	}

	undo (): void {

		this.node.laneOffset.s = this.oldDistance;

		NodeFactoryService.updateLaneOffsetNode( this.node );

		this.rebuild( this.node.road );

	}

	redo (): void {

		this.execute();

	}

	rebuild ( road: TvRoad ): void {

		SceneService.removeWithChildren( road.gameObject, true );

		TvMapBuilder.buildRoad( this.map.gameObject, road );

		this.laneHelper.drawRoad( road, LineType.DASHED, true );

	}

}
