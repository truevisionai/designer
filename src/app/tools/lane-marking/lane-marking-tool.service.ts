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
import { Vector3 } from 'three';
import { TvLaneCoord } from 'app/map/models/tv-lane-coord';
import { Log } from 'app/core/utils/log';
import { Maths } from 'app/utils/maths';
import { RoadGeometryService } from "../../services/road/road-geometry.service";

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

	rebuild ( lane: TvLane ): void {

		this.laneService.updateLane( lane );

	}

	updateNode ( node: LaneMarkingNode ): void {

		this.rebuild( node.lane );

	}

	addRoadmark ( lane: TvLane, roadMark: TvLaneRoadMark ): void {

		lane.addRoadMarkInstance( roadMark );

		this.rebuild( lane );

	}

	addNode ( node: LaneMarkingNode ): void {

		this.addRoadmark( node.lane, node.roadmark );

	}

	removeRoadmark ( lane: TvLane, roadmark: TvLaneRoadMark ): void {

		lane.removeRoadMark( roadmark );

		this.rebuild( lane );

	}

	removeNode ( node: LaneMarkingNode ): void {

		this.removeRoadmark( node.lane, node.roadmark );

	}

	findCoord ( point: Vector3 ): TvLaneCoord | undefined {

		const laneCoord = this.roadService.findLaneCoord( point );

		if ( !laneCoord ) {
			Log.warn( 'LaneCoord not found' );
			return;
		}

		const lane = this.findBestLane( laneCoord );

		if ( !lane ) {
			Log.warn( 'Lane not found' );
			return;
		}

		return new TvLaneCoord( laneCoord.road, laneCoord.laneSection, lane, laneCoord.laneDistance, laneCoord.offset );
	}

	findBestLane ( coord: TvLaneCoord ): TvLane | undefined {

		const laneSection = coord.laneSection;

		const offset = RoadGeometryService.instance.findWidthUpto( laneSection.road, laneSection, coord.lane, coord.laneDistance - laneSection.s );

		const diff = Math.abs( coord.offset ) - Math.abs( offset );

		if ( Math.abs( coord.offset ) < 0.5 ) {

			return laneSection.getLaneById( 0 );

		} else if ( Math.abs( diff ) < 1.0 ) {

			return laneSection.getLaneById( coord.lane.id );

		}

	}

	createNode ( point: Vector3 ) {

		const laneCoord = this.roadService.findLaneCoord( point );

		if ( !laneCoord ) {
			Log.warn( 'LaneCoord not found' );
			return;
		}

		const lane = this.findBestLane( laneCoord );

		if ( !lane ) {
			Log.warn( 'Lane not found' );
			return;
		}

		const sOffset = Maths.clamp( laneCoord.laneDistance - lane.laneSection.s, 0, lane.laneSection.getLength() );

		let marking = lane.getRoadMarkAt( sOffset )?.clone( sOffset );

		if ( !marking ) {
			marking = TvLaneRoadMark.createSolid( lane, sOffset );
		}

		const road = lane.laneSection.road;

		const laneSection = lane.laneSection;

		return this.toolDebugger.createNode( road, laneSection, lane, marking );

	}

}
