/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { EmptyVisualizer } from "../../../core/overlay-handlers/empty-visualizer";
import { TvJunction } from "../../../map/models/junctions/tv-junction";
import { JunctionDebugService } from "../../../services/junction/junction.debug";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolJunctionVisualizer extends EmptyVisualizer<TvJunction> {

	constructor (
		private junctionDebugService: JunctionDebugService,
	) {
		super();
	}

	onSelected ( object: TvJunction ): void {

		this.junctionDebugService.removeEntries( object );
		this.junctionDebugService.removeManeuvers( object );

		this.junctionDebugService.showManeuvers( object );
		this.junctionDebugService.showEntries( object );

	}

	onUnselected ( object: TvJunction ): void {

		this.junctionDebugService.removeManeuvers( object );
		this.junctionDebugService.removeEntries( object );

	}

	clear (): void {

		this.junctionDebugService.clear();

	}

}