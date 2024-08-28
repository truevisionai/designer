import { Injectable } from "@angular/core";
import { CornerControlPoint } from "./crosswalk-tool-debugger";
import { PointOverlayHandler } from "../maneuver/point-overlay.handler";

@Injectable( {
	providedIn: 'root'
} )
export class CornerPointOverlayHandler extends PointOverlayHandler<CornerControlPoint> {

	onAdded ( object: CornerControlPoint ): void {

		object.select();

		this.updateOverlay( object.roadObject );

	}

	onUpdated ( object: CornerControlPoint ): void {

		object.select();

		this.updateOverlay( object.roadObject );

	}

	onRemoved ( object: CornerControlPoint ): void {

		object.unselect();

		this.updateOverlay( object.roadObject );

	}

}
