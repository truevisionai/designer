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
import { LaneOffsetInspector } from 'app/views/inspectors/lane-offset-inspector/lane-offset-inspector.component';

export class AddLaneOffsetCommand extends BaseCommand {

	private road: TvRoad;
	private laneOffset: TvRoadLaneOffset;

	private command: SetInspectorCommand;

	constructor ( private tool: LaneOffsetTool, private lane: TvLane, private position: Vector3 ) {

		super();

		this.road = this.map.getRoadById( this.lane.roadId );

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		TvMapQueries.getRoadByCoords( this.position.x, this.position.y, posTheta );

		const curentLaneOffset = this.road.getLaneOffsetAt( posTheta.s );

		if ( curentLaneOffset ) {

			this.laneOffset = curentLaneOffset.clone( posTheta.s );

		} else {

			this.laneOffset = new TvRoadLaneOffset( this.road, posTheta.s, 0, 0, 0, 0 );

		}

		this.laneOffset.node.updatePosition();

		this.command = new SetInspectorCommand( LaneOffsetInspector, this.laneOffset );
	}

	execute (): void {

		this.road.addLaneOffsetInstance( this.laneOffset );

		SceneService.add( this.laneOffset.node );

		this.command.execute();

	}

	undo (): void {

		this.road.removeLaneOffset( this.laneOffset );

		SceneService.remove( this.laneOffset.node );

		this.command.undo();

	}

	redo (): void {

		this.execute();

	}

}
