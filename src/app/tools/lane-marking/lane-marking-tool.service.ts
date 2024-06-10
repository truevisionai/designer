/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { LaneMarkingNode } from 'app/objects/lane-road-mark-node';
import { TvLane } from 'app/map/models/tv-lane';
import { TvLaneRoadMark } from 'app/map/models/tv-lane-road-mark';
import { LaneService } from 'app/services/lane/lane.service';
import { LaneMarkingToolDebugger } from './lane-marking-tool.debugger';
import { RoadService } from 'app/services/road/road.service';

@Injectable( {
	providedIn: 'root'
} )
export class LaneMarkingToolService {

	constructor (
		public roadService: RoadService,
		public toolDebugger: LaneMarkingToolDebugger,
		public base: BaseToolService,
		private laneService: LaneService,
	) { }

	rebuild ( lane: TvLane ) {

		this.laneService.updateLane( lane );

	}

	updateNode ( node: LaneMarkingNode ) {

		this.rebuild( node.lane );

	}

	addRoadmark ( lane: TvLane, roadMark: TvLaneRoadMark ) {

		lane.addRoadMarkInstance( roadMark );

		this.rebuild( lane );

	}

	addNode ( node: LaneMarkingNode ) {

		this.addRoadmark( node.lane, node.roadmark );

	}

	removeRoadmark ( lane: TvLane, roadmark: TvLaneRoadMark ) {

		lane.removeRoadMark( roadmark );

		this.rebuild( lane );

	}

	removeNode ( node: LaneMarkingNode ) {

		this.removeRoadmark( node.lane, node.roadmark );

	}

}
