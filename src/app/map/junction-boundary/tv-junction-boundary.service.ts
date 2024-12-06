/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunction } from "../models/junctions/tv-junction";
import { TvJunctionInnerBoundaryService } from "./tv-junction-inner-boundary.service";
import { TvBoundarySegmentType, TvJunctionBoundary } from "./tv-junction-boundary";
import { TvJunctionOuterBoundaryService } from "./tv-junction-outer-boundary.service";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { COLOR } from "../../views/shared/utils/colors.service";
import { Color } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryService {

	public static instance: TvJunctionBoundaryService;

	constructor (
		private outerBoundaryService: TvJunctionOuterBoundaryService,
		private innerBoundaryService: TvJunctionInnerBoundaryService,
		private debugService: DebugDrawService,
	) {
		TvJunctionBoundaryService.instance = this;
	}

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

		// this.debugBoundary( junction.innerBoundary );

	}

	// eslint-disable-next-line no-undef
	debugBoundary ( boundary: TvJunctionBoundary, color: number = COLOR.RED ): void {

		boundary.getSegments().forEach( segment => {

			const white = new Color( 1, 1, 1 );

			console.log( segment, segment.getPoints() );

			segment.getPoints().forEach( ( position, index ) => {

				// as the index grows, make the white color will get darker
				const color = white.clone().multiplyScalar( 1 - index / 10 );

				this.debugService.drawText( index.toString(), position.toVector3(), 0.2, color.getHex() );

			} )

		} )

	}
}
