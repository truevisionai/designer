/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { Vector3 } from 'three';
import { LaneWidthNode } from '../../../modules/three-js/objects/lane-width-node';
import { TvMapBuilder } from '../../../modules/tv-map/builders/tv-map-builder';
import { TvLane } from '../../../modules/tv-map/models/tv-lane';
import { TvLaneWidth } from '../../../modules/tv-map/models/tv-lane-width';
import { LaneWidthInspector } from '../../../views/inspectors/lane-width-inspector/lane-width-inspector.component';
import { BaseCommand } from '../../commands/base-command';
import { SetInspectorCommand } from '../../commands/set-inspector-command';
import { SceneService } from '../../services/scene.service';
import { LaneWidthTool } from './lane-width-tool';
import { SelectLaneWidthNodeCommand } from './select-lane-width-node-command';

export class CreateWidthNodeCommand extends BaseCommand {

	private inspectorCommand: SetInspectorCommand;
	private selectCommand: SelectLaneWidthNodeCommand;

	private readonly laneWidth: TvLaneWidth;
	private readonly oldNode: LaneWidthNode;
	private readonly oldLane: TvLane;

	constructor ( private tool: LaneWidthTool, private newLane: TvLane, position: Vector3 ) {

		super();

		this.oldNode = tool.node;
		this.oldLane = tool.lane;

		const road = newLane.laneSection.road;

		const roadCoord = road.getCoordAt( position );

		const s = roadCoord.s - newLane.laneSection.s;

		this.laneWidth = newLane.getLaneWidthAt( s ).clone( s );

		this.laneWidth.node = new LaneWidthNode( this.laneWidth );

		this.inspectorCommand = new SetInspectorCommand( LaneWidthInspector, this.laneWidth );
		this.selectCommand = new SelectLaneWidthNodeCommand( this.tool, this.laneWidth.node );
	}

	execute (): void {

		this.oldLane?.laneSection.road.hideWidthNodes();
		this.newLane.laneSection.road.showWidthNodes();

		this.tool.node = this.laneWidth.node;
		this.tool.lane = this.newLane;

		this.newLane.addWidthRecordInstance( this.laneWidth );
		this.laneWidth.node.updateLaneWidthValues();

		SceneService.add( this.laneWidth.node );
		this.rebuild( this.laneWidth.node.road );

		this.tool.laneHelper.clear();
		this.tool.laneHelper.drawRoad( this.newLane?.laneSection.road );

		this.inspectorCommand.execute();
		this.selectCommand.execute();
	}

	undo (): void {

		this.newLane?.laneSection.road.hideWidthNodes();
		this.oldLane?.laneSection.road.showWidthNodes();

		this.tool.laneHelper.clear();
		this.tool.laneHelper.drawRoad( this.oldLane?.laneSection.road );

		this.tool.node = this.oldNode;
		this.tool.lane = this.oldLane;

		const index = this.laneWidth.node.lane.width.findIndex(
			laneWidth => laneWidth.uuid === this.laneWidth.uuid
		);
		this.laneWidth.node.lane.width.splice( index, 1 );
		this.laneWidth.node.updateLaneWidthValues();

		SceneService.remove( this.laneWidth.node );
		this.rebuild( this.laneWidth.node.road );

		this.inspectorCommand.undo();
		this.selectCommand.undo();
	}

	redo (): void {

		this.execute();

	}

	rebuild ( road: TvRoad ): void {

		SceneService.removeWithChildren( road.gameObject, true );
		TvMapBuilder.buildRoad( this.map.gameObject, road );

	}

}
