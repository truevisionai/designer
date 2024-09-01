import { Injectable } from "@angular/core";
import { EmptyController } from "app/core/object-handlers/empty-controller";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { JunctionOverlay } from "app/services/junction/junction-overlay";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { TvJunctionSignalizationInspector } from "./tv-junction-signalization.inspector";

@Injectable( {
	providedIn: 'root'
} )
export class TrafficLightJunctionController extends EmptyController<JunctionOverlay> {

	showInspector ( object: JunctionOverlay ): void {

		this.setInspector( new TvJunctionSignalizationInspector( object.junction ) );

	}

}

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
