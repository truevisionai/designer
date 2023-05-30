/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { LaneInspectorComponent } from 'app/views/inspectors/lane-type-inspector/lane-inspector.component';
import { LaneMarkingTool } from '../tools/lane-marking-tool';
import { BaseCommand } from './base-command';
import { SetInspectorCommand } from './set-inspector-command';
import { UnselectRoadmarkNodeCommand } from './unselect-roadmark-node-command';
import { ICommand } from './i-command';

export class UnselectLaneForRoadMarkCommand extends BaseCommand {

	private road: TvRoad;
	private inspectorCommand: ICommand;
	private unselectCommand: ICommand;

	constructor ( private tool: LaneMarkingTool, private lane: TvLane ) {

		super();

		if ( lane ) this.road = this.map.getRoadById( this.lane.roadId );

		this.inspectorCommand = new SetInspectorCommand( LaneInspectorComponent, null );

		this.unselectCommand = new UnselectRoadmarkNodeCommand( this.tool, this.tool.node );

	}

	execute (): void {

		this.road?.hideLaneMarkingNodes();

		this.tool.laneHelper.clear();

		this.tool.lane = null;

		this.inspectorCommand.execute();

		this.unselectCommand.execute();
	}

	undo (): void {

		this.road?.showLaneMarkingNodes();

		this.tool.laneHelper.drawRoad( this.road );

		this.tool.lane = this.lane;

		this.inspectorCommand.undo();

		this.unselectCommand.undo();
	}

	redo (): void {

		this.execute();

	}
}
