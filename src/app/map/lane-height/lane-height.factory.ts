/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneElementFactory, ILaneNodeFactory } from "app/core/interfaces/lane-element.factory";
import { TvLaneHeight } from "./lane-height.model";
import { Vector3 } from "app/core/maths"
import { Injectable } from "@angular/core";
import { TvLane } from "../models/tv-lane";
import { Asset } from "app/assets/asset.model";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { LanePointNode } from "../../objects/lane-node";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightFactory extends LaneElementFactory<TvLaneHeight> implements ILaneNodeFactory<LanePointNode<TvLaneHeight>> {

	createFromPosition ( position: Vector3, lane: TvLane ): TvLaneHeight {

		if ( !lane ) {
			console.error( "Lane is required" );
			return new TvLaneHeight( 0, 0, 0 );
		}

		const posTheta = this.getPosTheta( position, lane );

		if ( !posTheta ) {
			console.error( "Position is not on the lane" );
			return new TvLaneHeight( 0, 0, 0 );
		}

		const height = lane.getHeightValue( posTheta.s );

		return new TvLaneHeight( posTheta.s, height?.inner || 0, height?.outer || 0 );

	}

	createNode ( position: Vector3, lane: TvLane ): LanePointNode<TvLaneHeight> {

		const height = this.createFromPosition( position, lane );

		// const node = DebugDrawService.instance.createLaneHeightNode( lane.laneSection.road, lane, height );

		const node = DebugDrawService.instance.createLaneNode( lane.laneSection.road, lane, height );

		// const posTheta = this.getPosTheta( position, lane );

		// return new LaneNode( lane, height, posTheta.s, position );

		return node;

	}

	createFromAsset ( asset: Asset, position: Vector3 ): TvLaneHeight {

		return new TvLaneHeight( 0, 0, 0 );

	}

}
