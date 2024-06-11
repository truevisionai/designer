/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { BaseToolService } from '../base-tool.service';
import { LaneWidthNode } from 'app/objects/lane-width-node';
import { Vector3 } from 'three';
import { TvUtils } from 'app/map/models/tv-utils';
import { SnackBar } from 'app/services/snack-bar.service';
import { LaneWidthToolDebugger } from './lane-width-tool.debugger';
import { RoadService } from "../../services/road/road.service";
import { LaneWidthService } from "./lane-width.service";
import { DebugState } from "../../services/debug/debug-state";

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

		const index = node.lane.getLaneWidthVector().findIndex( i => i.uuid === node.laneWidth.uuid );

		if ( index === -1 ) {
			this.snackBar.error( 'Unexpected error. Not able to find this node' );
			return;
		}

		if ( index === 0 ) {
			this.snackBar.warn( 'First node cannot be edited. Please add a new node.' );
			return;
		}

		const road = node.lane.laneSection.road;

		const roadCoord = road.getPosThetaByPosition( position );

		const adjustedS = roadCoord.s - node.lane.laneSection.s;

		// update s offset as per the new position on road
		node.laneWidth.s = adjustedS;

		const startPosition = road.getLaneStartPosition( node.lane, adjustedS ).toVector3();

		node.laneWidth.a = position.distanceTo( startPosition );

		const laneSectionLength = road.length - node.lane.laneSection.s;

		TvUtils.computeCoefficients( node.lane.width, laneSectionLength );

		this.toolDebugger.updateDebugState( road, DebugState.SELECTED );

	}



}
