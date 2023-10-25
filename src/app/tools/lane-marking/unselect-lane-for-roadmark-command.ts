/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BaseCommand } from '../../commands/base-command';
import { ICommand } from '../../commands/i-command';
import { LaneMarkingTool } from './lane-marking-tool';
import { UnselectRoadmarkNodeCommand } from './unselect-roadmark-node-command';

export class UnselectLaneForRoadMarkCommand extends BaseCommand {

	private road: TvRoad;
	private unselectCommand: ICommand;

	constructor ( private tool: LaneMarkingTool, private lane: TvLane ) {

		super();

		if ( lane ) this.road = this.map.getRoadById( this.lane.roadId );

		this.unselectCommand = new UnselectRoadmarkNodeCommand( this.tool, this.tool.node );

	}

	execute (): void {

		this.road?.hideLaneMarkingNodes();

		this.tool.laneHelper.clear();

		this.tool.lane = null;

		this.unselectCommand.execute();
	}

	undo (): void {

		this.road?.showLaneMarkingNodes();

		this.tool.laneHelper.drawRoad( this.road );

		this.tool.lane = this.lane;

		this.unselectCommand.undo();
	}

	redo (): void {

		this.execute();

	}
}
