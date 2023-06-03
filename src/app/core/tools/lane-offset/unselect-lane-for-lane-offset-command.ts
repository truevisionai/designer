/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BaseCommand } from '../../commands/base-command';
import { ICommand } from '../../commands/i-command';
import { LaneOffsetTool } from './lane-offset-tool';
import { UnselectLaneOffsetNodeCommand } from './unselect-lane-offset-node-command';

export class UnselectLaneForLaneOffsetCommand extends BaseCommand {

	private road: TvRoad;
	private unselectCommand: ICommand;

	constructor ( private tool: LaneOffsetTool, private lane: TvLane ) {

		super();

		if ( lane ) this.road = this.map.getRoadById( this.lane.roadId );

		this.unselectCommand = new UnselectLaneOffsetNodeCommand( this.tool, this.tool.node );

	}

	execute (): void {

		this.road?.hideLaneOffsetNodes();

		this.tool.laneHelper.clear();

		this.tool.lane = null;

		this.unselectCommand.execute();
	}

	undo (): void {

		this.road?.showLaneOffsetNodes();

		this.tool.laneHelper.drawRoad( this.road );

		this.tool.lane = this.lane;

		this.unselectCommand.undo();
	}

	redo (): void {

		this.execute();

	}
}
