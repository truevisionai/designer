/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneRoadMarkNode } from 'app/modules/three-js/objects/control-point';
import { OdRoadMarkBuilder } from 'app/modules/tv-map/builders/od-road-mark-builder';
import { Vector3 } from 'three';
import { NodeFactoryService } from '../factories/node-factory.service';
import { BaseCommand } from './base-command';

export class UpdateRoadmarkNodeCommand extends BaseCommand {

	constructor (
		private node: LaneRoadMarkNode,
		private newPosition: Vector3,
		private oldPosition: Vector3,
		private roadMarkbuilder: OdRoadMarkBuilder
	) {

		super();

	}

	execute (): void {

		NodeFactoryService.updateRoadMarkNodeByPosition( this.node, this.newPosition );

		this.roadMarkbuilder.buildRoad( this.map.getRoadById( this.node.lane.roadId ) );

	}

	undo (): void {

		NodeFactoryService.updateRoadMarkNodeByPosition( this.node, this.oldPosition );

		this.roadMarkbuilder.buildRoad( this.map.getRoadById( this.node.lane.roadId ) );

	}

	redo (): void {

		this.execute();

	}

}
