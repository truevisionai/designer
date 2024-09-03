/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { JunctionDebugService } from "../../../services/junction/junction.debug";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { JunctionOverlay } from "app/services/junction/junction-overlay";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverToolJunctionOverlayVisualizer extends NodeVisualizer<JunctionOverlay> {

	constructor (
		private junctionDebugService: JunctionDebugService,
	) {
		super();
	}

	onSelected ( object: JunctionOverlay ): void {

		super.onSelected( object );

		this.junctionDebugService.removeEntries( object.junction );
		this.junctionDebugService.removeManeuvers( object.junction );

		this.junctionDebugService.showManeuvers( object.junction );
		this.junctionDebugService.showEntries( object.junction );

	}

	onUnselected ( object: JunctionOverlay ): void {

		super.onUnselected( object );

		this.junctionDebugService.removeManeuvers( object.junction );
		this.junctionDebugService.removeEntries( object.junction );

	}

	clear (): void {

		super.clear();

		this.junctionDebugService.clear();

	}

}
