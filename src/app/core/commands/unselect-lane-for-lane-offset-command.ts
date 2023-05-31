/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { LaneMarkingTool } from '../tools/lane-marking-tool';
import { BaseCommand } from './base-command';
import { UnselectRoadmarkNodeCommand } from './unselect-roadmark-node-command';
import { ICommand } from './i-command';
import { LaneOffsetTool } from '../tools/lane-offset-tool';
import { UnselectLaneOffsetNodeCommand } from './unselect-lane-offset-node-command';
import { OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';

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
