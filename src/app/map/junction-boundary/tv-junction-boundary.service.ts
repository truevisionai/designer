/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvJunctionInnerBoundaryService } from "./tv-junction-inner-boundary.service";
import { TvJunctionBoundary } from "./tv-junction-boundary";
import { TvJunctionOuterBoundaryService } from "./tv-junction-outer-boundary.service";
import { DebugDrawService } from "app/services/debug/debug-draw.service";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryService {

	constructor (
		private outerBoundaryService: TvJunctionOuterBoundaryService,
		private innerBoundaryService: TvJunctionInnerBoundaryService,
		private debugService: DebugDrawService,
	) { }

	update ( junction: TvJunction ): void {

		if ( !junction.innerBoundary ) {
			junction.innerBoundary = new TvJunctionBoundary();
		} else {
			junction.innerBoundary.clearSegments();
		}

		this.innerBoundaryService.update( junction, junction.innerBoundary );

		if ( !junction.outerBoundary ) {
			junction.outerBoundary = new TvJunctionBoundary();
		} else {
			junction.outerBoundary.clearSegments();
		}

		this.outerBoundaryService.update( junction, junction.outerBoundary );

	}

}
