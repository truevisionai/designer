import { Injectable } from "@angular/core";
import { EmptyObjectHandler } from "app/core/object-handlers/empty-object-handler";
import { NodeOverlayHandler } from "app/core/overlay-handlers/node-overlay-handler";
import { JunctionOverlay } from "app/services/junction/junction-overlay";
import { JunctionDebugService } from "app/services/junction/junction.debug";

@Injectable( {
	providedIn: 'root'
} )
export class JunctionHandlerTrafficLight extends EmptyObjectHandler<JunctionOverlay> {

}

@Injectable( {
	providedIn: 'root'
} )
export class JunctionOverlayHandlerTrafficLight extends NodeOverlayHandler<JunctionOverlay> {

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
