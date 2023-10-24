/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from 'app/modules/tv-map/models/tv-lane-road-mark';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';
import { LaneRoadMarkNode } from '../../../modules/three-js/objects/lane-road-mark-node';
import { BaseCommand } from '../../commands/base-command';
import { SceneService } from '../../services/scene.service';
import { LaneMarkingTool } from './lane-marking-tool';
import { SelectRoadmarNodeCommand } from './select-roadmark-node-command';

export class AddRoadmarkNodeCommand extends BaseCommand {

	private road: TvRoad;
	private roadMark: TvLaneRoadMark;

	private oldLane: TvLane;

	private selectCommand: SelectRoadmarNodeCommand;

	constructor ( private tool: LaneMarkingTool, private lane: TvLane, position: Vector3 ) {

		super();

		this.oldLane = this.tool.lane;

		const road = this.road = lane.laneSection.road;

		const roadCoord = road.getCoordAt( position );

		const s = roadCoord.s - lane.laneSection.s;

		// get the exisiting lane road mark at s and clone it
		this.roadMark = lane.getRoadMarkAt( s ).clone( s );

		this.roadMark.node = new LaneRoadMarkNode( lane, this.roadMark );

		this.selectCommand = new SelectRoadmarNodeCommand( this.tool, this.roadMark.node );

	}

	execute (): void {

		this.selectCommand.execute();

		this.tool.lane = this.lane;

		this.lane.addRoadMarkInstance( this.roadMark );

		SceneService.addToMain( this.roadMark.node );

		this.tool.roadMarkBuilder.buildRoad( this.road );

	}

	undo (): void {

		this.selectCommand.undo();

		this.tool.lane = this.oldLane;

		const index = this.lane.roadMark.findIndex( roadmark => roadmark.uuid === this.roadMark.uuid );

		this.lane.roadMark.splice( index, 1 );

		SceneService.removeFromMain( this.roadMark.node );

		this.tool.roadMarkBuilder.buildRoad( this.road );
	}

	redo (): void {

		this.execute();

	}

}
