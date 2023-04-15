/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneOffsetNode } from 'app/modules/three-js/objects/control-point';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';
import { SetInspectorCommand } from './set-inspector-command';
import { LaneOffsetTool } from '../tools/lane-offset-tool';
import { Vector3 } from 'three';
import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { NodeFactoryService } from '../factories/node-factory.service';
import { TvRoadLaneOffset } from 'app/modules/tv-map/models/tv-road-lane-offset';
import { LaneOffsetInspector, LaneOffsetInspectorData } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';

export class AddLaneOffsetCommand extends BaseCommand {

	private road: TvRoad;
	private node: LaneOffsetNode;
	private laneOffset: TvRoadLaneOffset;

	private command: SetInspectorCommand;

	constructor ( private tool: LaneOffsetTool, private lane: TvLane, private position: Vector3 ) {

		super();

		this.road = this.map.getRoadById( this.lane.roadId );

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		TvMapQueries.getRoadByCoords( this.position.x, this.position.y, posTheta );

		this.laneOffset = this.road.getLaneOffsetAt( posTheta.s ).clone( posTheta.s );

		this.node = NodeFactoryService.createLaneOffsetNode( this.road, this.laneOffset );

		this.command = new SetInspectorCommand( LaneOffsetInspector, new LaneOffsetInspectorData( this.node, this.road ) );
	}

	execute (): void {

		this.road.addLaneOffsetInstance( this.laneOffset );

		SceneService.add( this.node );

		this.command.execute();

	}

	undo (): void {

		this.road.removeLaneOffset( this.node.laneOffset );

		SceneService.remove( this.node );

		this.command.undo();

	}

	redo (): void {

		this.execute();

	}

}
