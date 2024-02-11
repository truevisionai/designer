/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { LaneElementFactory } from "app/core/interfaces/lane-element.factory";
import { TvLaneHeight } from "./lane-height.model";
import { Vector3 } from "three";
import { Injectable } from "@angular/core";
import { TvLane } from "../models/tv-lane";
import { AssetNode } from "app/views/editor/project-browser/file-node.model";

@Injectable( {
	providedIn: 'root'
} )
export class LaneHeightFactory extends LaneElementFactory<TvLaneHeight> {

	createFromPosition ( position: Vector3, lane: TvLane ): TvLaneHeight {

		if ( !lane ) throw new Error( "Lane is required" );

		const posTheta = this.getPosTheta( position, lane );

		if ( !posTheta ) throw new Error( "Position is not on the lane" );

		const height = lane.getHeightValue( posTheta.s );

		return new TvLaneHeight( posTheta.s, height?.inner || 0, height?.outer || 0 );

	}

	createFromAsset ( asset: AssetNode, position: Vector3 ): TvLaneHeight {

		throw new Error( "Method not implemented." );

	}

}
