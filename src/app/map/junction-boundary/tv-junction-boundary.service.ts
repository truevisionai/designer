/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { TvJunctionBoundary } from "./tv-junction-boundary";
import { DebugDrawService } from "app/services/debug/debug-draw.service";
import { COLOR } from "../../views/shared/utils/colors.service";
import { Color } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class TvJunctionBoundaryService {

	constructor (
		private debugService: DebugDrawService,
	) {
	}

	private debugBoundary ( boundary: TvJunctionBoundary, color: number = COLOR.RED ): void {

		boundary.getSegments().forEach( segment => {

			const white = new Color( 1, 1, 1 );

			segment.getOuterPoints().forEach( ( position, index ) => {

				// as the index grows, make the white color will get darker
				const color = white.clone().multiplyScalar( 1 - index / 10 );

				this.debugService.drawText( index.toString(), position.toVector3(), 0.2, color.getHex() );

			} )

		} )

	}
}
