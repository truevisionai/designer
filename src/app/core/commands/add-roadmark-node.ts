/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from 'app/modules/tv-map/models/tv-lane';
import { TvLaneRoadMark } from 'app/modules/tv-map/models/tv-lane-road-mark';
import { TvRoad } from 'app/modules/tv-map/models/tv-road.model';
import { SceneService } from '../services/scene.service';
import { BaseCommand } from './base-command';
import { LaneMarkingTool } from '../tools/lane-marking-tool';
import { Vector3 } from 'three';
import { TvPosTheta } from 'app/modules/tv-map/models/tv-pos-theta';
import { TvMapQueries } from 'app/modules/tv-map/queries/tv-map-queries';
import { NodeFactoryService } from '../factories/node-factory.service';
import { LaneRoadMarkNode } from 'app/modules/three-js/objects/control-point';
import { SetInspectorCommand } from './set-inspector-command';
import { LaneRoadmarkInspectorComponent } from 'app/views/inspectors/lane-roadmark-inspector/lane-roadmark-inspector.component';

export class AddRoadmarkNodeCommand extends BaseCommand {

	private road: TvRoad;
	private roadMark: TvLaneRoadMark;

	private oldLane: TvLane;
	private oldNode: LaneRoadMarkNode;

	private inspectorCommand: any;

	constructor ( private tool: LaneMarkingTool, private lane: TvLane, position: Vector3 ) {

		super();

		this.oldLane = this.tool.lane;
		this.oldNode = this.tool.pointerObject;

		this.road = this.map.getRoadById( this.lane.roadId );

		const posTheta = new TvPosTheta();

		// getting position on track in s/t coordinates
		TvMapQueries.getRoadByCoords( position.x, position.y, posTheta );

		// get the exisiting lane road mark at s and clone it
		this.roadMark = lane.getRoadMarkAt( posTheta.s ).clone( posTheta.s );

		this.roadMark.node = NodeFactoryService.createRoadMarkNode( lane, this.roadMark );

		this.inspectorCommand = new SetInspectorCommand( LaneRoadmarkInspectorComponent, this.roadMark )

	}

	execute (): void {

		this.tool.node?.unselect();

		this.tool.node = this.roadMark.node;

		this.tool.node?.select();

		this.tool.lane = this.lane;

		this.lane.addRoadMarkInstance( this.roadMark );

		this.inspectorCommand.execute();

		SceneService.add( this.roadMark.node );

		this.tool.roadMarkBuilder.buildRoad( this.road );

	}

	undo (): void {

		this.tool.node?.unselect();

		this.tool.node = this.oldNode;

		this.tool.node?.select();

		this.tool.lane = this.oldLane;

		const index = this.lane.roadMark.findIndex( roadmark => roadmark.uuid === this.roadMark.uuid );

		this.lane.roadMark.splice( index, 1 );

		SceneService.remove( this.roadMark.node );

		this.inspectorCommand.undo();

		this.tool.roadMarkBuilder.buildRoad( this.road );
	}

	redo (): void {

		this.execute();

	}

}
