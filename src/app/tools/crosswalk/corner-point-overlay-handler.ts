import { Injectable } from "@angular/core";
import { CornerControlPoint } from "./crosswalk-tool-debugger";
import { NodeOverlayHandler } from "app/core/overlay-handlers/node-overlay-handler";

@Injectable( {
	providedIn: 'root'
} )
export class CornerPointOverlayHandler extends NodeOverlayHandler<CornerControlPoint> {

	onAdded ( object: CornerControlPoint ): void {

		super.onAdded( object );

		this.updateOverlay( object.roadObject );

	}

	onUpdated ( object: CornerControlPoint ): void {

		super.onUpdated( object );

		this.updateOverlay( object.roadObject );

	}

	onRemoved ( object: CornerControlPoint ): void {

		super.onRemoved( object );

		this.updateOverlay( object.roadObject );

	}

}
