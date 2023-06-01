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
import { LineType, OdLaneReferenceLineBuilder } from 'app/modules/tv-map/builders/od-lane-reference-line-builder';
import { COLOR } from 'app/shared/utils/colors.service';

export class SelectLaneForLaneOffsetCommand extends BaseCommand {

	private newRoad: TvRoad;

	private oldRoad: TvRoad;
	private oldLane: TvLane;

	private unselectCommand: ICommand;

	constructor ( private tool: LaneOffsetTool, private newLane: TvLane ) {

		super();

		this.oldLane = tool.lane;

		if ( newLane ) this.newRoad = this.map.getRoadById( this.newLane.roadId );
		if ( this.oldLane ) this.oldRoad = this.map.getRoadById( this.oldLane.roadId );

		this.unselectCommand = new UnselectLaneOffsetNodeCommand( this.tool, this.tool.node );

	}

	execute (): void {

		this.oldRoad?.hideLaneOffsetNodes();

		this.tool.laneHelper.clear();

		this.newRoad?.showLaneOffsetNodes();

		this.tool.laneHelper.drawRoad( this.newRoad )

		this.tool.lane = this.newLane;

		this.unselectCommand.execute();
	}

	undo (): void {

		this.newRoad?.hideLaneOffsetNodes();

		this.tool.laneHelper.clear();

		this.oldRoad?.showLaneOffsetNodes();

		this.tool.laneHelper.drawRoad( this.oldRoad )

		this.tool.lane = this.oldLane;

		this.unselectCommand.undo();
	}

	redo (): void {

		this.execute();

	}

}
