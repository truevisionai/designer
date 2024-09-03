/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "../../../core/visualizers/node-visualizer";
import { JunctionOverlay } from "../../../services/junction/junction-overlay";
import { JunctionDebugService } from "../../../services/junction/junction.debug";

@Injectable( {
	providedIn: 'root'
} )
export class TrafficLightJunctionVisualizer extends NodeVisualizer<JunctionOverlay> {

	constructor (
		private junctionDebugService: JunctionDebugService
	) {
		super();
	}

	onSelected ( object: JunctionOverlay ): void {

		super.onSelected( object );

		this.junctionDebugService.showManeuvers( object.junction );

		this.junctionDebugService.showGateLines( object.junction );

	}

	onUnselected ( object: JunctionOverlay ): void {

		super.onUnselected( object );

		this.junctionDebugService.removeManeuvers( object.junction );

		this.junctionDebugService.removeGateLines( object.junction );

	}

	clear (): void {

		this.junctionDebugService.clear();

	}

}