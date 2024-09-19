/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvLaneCoord } from "../../map/models/tv-lane-coord";
import { Object3D } from "three";
import { DebugDrawService } from "../../services/debug/debug-draw.service";
import { COLOR } from "../../views/shared/utils/colors.service";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionGateBuilder {

	constructor (
		private debugDraw: DebugDrawService
	) {
	}

	build ( laneCoord: TvLaneCoord ): Object3D {

		const posTheta = laneCoord.posTheta.clone();

		if ( laneCoord.lane.isLeft ) posTheta.hdg += Math.PI;

		return this.debugDraw.createLaneWidthLine( laneCoord, laneCoord, COLOR.BLUE, 8 );

	}

}
