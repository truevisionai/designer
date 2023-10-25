/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Vector3 } from 'three';
import { LaneRoadMarkNode } from '../../modules/three-js/objects/lane-road-mark-node';
import { BaseCommand } from '../../commands/base-command';
import { LaneRoadMarkFactory } from 'app/factories/lane-road-mark-factory';

export class UpdateRoadmarkNodeCommand extends BaseCommand {

	constructor (
		private node: LaneRoadMarkNode,
		private newPosition: Vector3,
		private oldPosition: Vector3,
		private roadMarkbuilder: LaneRoadMarkFactory
	) {

		super();

	}

	execute (): void {

		// NodeFactoryService.updateRoadMarkNodeByPosition( this.node, this.newPosition );
		this.node.updateByPosition( this.newPosition );

		const road = this.map.getRoadById( this.node.lane.roadId );

		const laneSection = road.getLaneSectionById( this.node.lane.laneSectionId );

		this.roadMarkbuilder.buildLane( road, this.node.lane );

	}

	undo (): void {

		// NodeFactoryService.updateRoadMarkNodeByPosition( this.node, this.oldPosition );
		this.node.updateByPosition( this.oldPosition );

		const road = this.map.getRoadById( this.node.lane.roadId );

		const laneSection = road.getLaneSectionById( this.node.lane.laneSectionId );

		this.roadMarkbuilder.buildLane( road, this.node.lane );

	}

	redo (): void {

		this.execute();

	}

}
