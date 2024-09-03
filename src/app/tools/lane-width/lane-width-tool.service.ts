/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { LaneWidthNode } from 'app/tools/lane-width/objects/lane-width-node';
import { Vector3 } from 'three';
import { TvUtils } from 'app/map/models/tv-utils';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneWidthToolDebugger } from './lane-width-tool.debugger';
import { RoadService } from "../../services/road/road.service";
import { LaneWidthService } from "./lane-width.service";
import { DebugState } from "../../services/debug/debug-state";
import { RoadGeometryService } from "../../services/road/road-geometry.service";

@Injectable( {
	providedIn: 'root'
} )
export class LaneWidthToolService {

	constructor (
		public base: BaseToolService,
		public laneWidthService: LaneWidthService,
		public snackBar: SnackBar,
		public toolDebugger: LaneWidthToolDebugger,
		public roadService: RoadService,
	) {
	}

	updateByPosition ( node: LaneWidthNode, position: Vector3 ) {

		if ( !this.isValid( node ) ) return;

		const road = node.lane.laneSection.road;

		const roadCoord = this.roadService.findRoadCoord( position );

		if ( !roadCoord ) return;

		const sLaneSection = roadCoord.s - node.lane.laneSection.s;

		const startPosTheta = RoadGeometryService.instance.findLaneStartPosition( road, node.lane.laneSection, node.lane, sLaneSection );

		if ( !startPosTheta ) return;

		// update s offset as per the new position on road
		node.laneWidth.s = sLaneSection;

		node.laneWidth.a = position.distanceTo( startPosTheta.position );

		const laneSectionLength = road.length - node.lane.laneSection.s;

		TvUtils.computeCoefficients( node.lane.width, laneSectionLength );

		this.toolDebugger.updateDebugState( road, DebugState.SELECTED );

	}

	isValid ( node: LaneWidthNode ): boolean {

		const index = node.lane.getLaneWidthVector().findIndex( i => i.uuid === node.laneWidth.uuid );

		if ( index === -1 ) {
			this.snackBar.error( 'Unexpected error. Not able to find this node' );
			return false;
		}

		if ( index === 0 ) {
			this.snackBar.warn( 'First node cannot be edited. Please add a new node.' );
			return false;
		}

		return true;

	}

}
