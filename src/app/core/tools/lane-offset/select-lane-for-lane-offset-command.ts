/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { BaseCommand } from '../../commands/base-command';
import { ICommand } from '../../commands/i-command';
import { LaneOffsetTool } from './lane-offset-tool';
import { UnselectLaneOffsetNodeCommand } from './unselect-lane-offset-node-command';

export class SelectLaneForLaneOffsetCommand extends BaseCommand {

	private readonly newRoad: TvRoad;

	private readonly oldRoad: TvRoad;
	private readonly oldLane: TvLane;

	private unselectCommand: ICommand;

	constructor ( private tool: LaneOffsetTool, private newLane: TvLane ) {

		super();

		this.oldLane = tool.lane;
		this.oldRoad = tool.lane?.laneSection.road;

		this.newRoad = newLane?.laneSection?.road;

		this.unselectCommand = new UnselectLaneOffsetNodeCommand( this.tool, this.tool.node );

	}

	execute (): void {

		this.oldRoad?.hideLaneOffsetNodes();
		this.newRoad?.showLaneOffsetNodes();

		this.tool.laneHelper.clear();
		this.tool.laneHelper.drawRoad( this.newRoad );

		this.tool.lane = this.newLane;

		this.unselectCommand.execute();
	}

	undo (): void {

		this.newRoad?.hideLaneOffsetNodes();
		this.oldRoad?.showLaneOffsetNodes();

		this.tool.laneHelper.clear();
		this.tool.laneHelper.drawRoad( this.oldRoad );

		this.tool.lane = this.oldLane;

		this.unselectCommand.undo();
	}

	redo (): void {

		this.execute();

	}

}
