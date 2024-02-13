/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneElementFactory, ILaneNodeFactory } from "app/core/interfaces/lane-element.factory";
import { TvLaneHeight } from "./lane-height.model";
import { Vector3 } from "three";
import { Injectable } from "@angular/core";
import { TvLane } from "../models/tv-lane";
import { AssetNode } from "app/views/editor/project-browser/file-node.model";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { LaneNode } from "../../objects/lane-node";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightFactory extends LaneElementFactory<TvLaneHeight> implements ILaneNodeFactory<LaneNode<TvLaneHeight>> {

	createFromPosition ( position: Vector3, lane: TvLane ): TvLaneHeight {

		if ( !lane ) throw new Error( "Lane is required" );

		const posTheta = this.getPosTheta( position, lane );

		if ( !posTheta ) throw new Error( "Position is not on the lane" );

		const height = lane.getHeightValue( posTheta.s );

		return new TvLaneHeight( posTheta.s, height?.inner || 0, height?.outer || 0 );

	}

	createNode ( position: Vector3, lane: TvLane ): LaneNode<TvLaneHeight> {

		const height = this.createFromPosition( position, lane );

		// const node = DebugDrawService.instance.createLaneHeightNode( lane.laneSection.road, lane, height );

		const node = DebugDrawService.instance.createLaneNode( lane.laneSection.road, lane, height );

		// const posTheta = this.getPosTheta( position, lane );

		// return new LaneNode( lane, height, posTheta.s, position );

		return node;

	}

	createFromAsset ( asset: AssetNode, position: Vector3 ): TvLaneHeight {

		throw new Error( "Method not implemented." );

	}

}
