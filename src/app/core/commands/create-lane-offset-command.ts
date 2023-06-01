/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';
import { LaneOffsetInspector } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';
import { Vector3 } from 'three';
import { TvRoad } from '../../modules/tv-map/models/tv-road.model';
import { SceneService } from '../services/scene.service';
import { LaneOffsetTool } from '../tools/lane-offset-tool';
import { BaseCommand } from './base-command';
import { SelectLaneOffsetNodeCommand } from './select-lane-offset-node-command';
import { SetInspectorCommand } from './set-inspector-command';

export class CreateLaneOffsetCommand extends BaseCommand {

	private readonly laneOffset: TvRoadLaneOffset;

	private command: SetInspectorCommand;
	private oldLane: TvLane;
	private oldRoad: TvRoad;
	private newRoad: TvRoad;
	private selectCommand: SelectLaneOffsetNodeCommand;

	constructor ( private tool: LaneOffsetTool, private newLane: TvLane, position: Vector3 ) {

		super();

		this.oldLane = tool.lane;
		this.oldRoad = tool.lane?.laneSection.road;

		const road = this.newRoad = newLane.laneSection.road;
		const roadCoord = road.getCoordAt( position );

		if ( road.getLaneOffsetAt( roadCoord.s ) ) {

			this.laneOffset = road.getLaneOffsetAt( roadCoord.s ).clone( roadCoord.s );

		} else {

			this.laneOffset = new TvRoadLaneOffset( road, roadCoord.s, 0, 0, 0, 0 );

		}

		this.laneOffset.node.updatePosition();

		this.command = new SetInspectorCommand( LaneOffsetInspector, this.laneOffset );
		this.selectCommand = new SelectLaneOffsetNodeCommand( this.tool, this.laneOffset.node );
	}

	execute (): void {

		this.oldRoad?.hideLaneOffsetNodes();
		this.newRoad?.showLaneOffsetNodes();

		this.tool.laneHelper.clear();
		this.tool.laneHelper.drawRoad( this.newRoad );

		this.tool.lane = this.newLane;

		this.newRoad.addLaneOffsetInstance( this.laneOffset );

		SceneService.add( this.laneOffset.node );

		this.command.execute();
		this.selectCommand.execute();

	}

	undo (): void {

		this.newRoad?.hideLaneOffsetNodes();
		this.oldRoad?.showLaneOffsetNodes();

		this.tool.laneHelper.clear();
		this.tool.laneHelper.drawRoad( this.oldRoad );

		this.tool.lane = this.oldLane;

		this.newRoad.removeLaneOffset( this.laneOffset );

		SceneService.remove( this.laneOffset.node );

		this.command.undo();
		this.selectCommand.undo();

	}

	redo (): void {

		this.execute();

	}

}
