/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneWidthNode } from 'app/modules/three-js/objects/control-point';
import { TvMapBuilder } from 'app/modules/tv-map/builders/od-builder.service';
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { NodeFactoryService } from '../factories/node-factory.service';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';

export class UpdateWidthNodeDistanceCommand extends BaseCommand {

	constructor (
		private node: LaneWidthNode,
		private newDistance: number,
		private oldDistance?: number,
		private laneHelper?: OdLaneReferenceLineBuilder
	) {

		super();

		if ( !this.oldDistance ) {

			this.oldDistance = this.node.laneWidth.s;

		}

	}

	execute (): void {

		this.node.laneWidth.s = this.node.s = this.newDistance;

		this.node.updateLaneWidthValues();

		NodeFactoryService.updateLaneWidthNodeLine( this.node );

		this.rebuild( this.node.road );


	}

	undo (): void {

		this.node.laneWidth.s = this.node.s = this.oldDistance;

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

		this.laneHelper.drawRoad( road, LineType.DASHED, true );

	}

}
