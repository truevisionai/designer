/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseOverlayHandler } from "app/core/overlay-handlers/base-overlay-handler";
import { NodeOverlayHandler } from "app/core/overlay-handlers/node-overlay-handler";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { SplineDebugService } from "app/services/debug/spline-debug.service";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverOverlayHandler extends NodeOverlayHandler<ManeuverMesh> {

	constructor (
		private junctionDebugService: JunctionDebugService,
		private splineDebugService: SplineDebugService
	) {
		super();
	}

	onSelected ( object: ManeuverMesh ): void {

		super.onSelected( object );

		this.splineDebugService.showControlPoints( object.connection.connectingRoad.spline );

	}

	onDefault ( object: ManeuverMesh ): void {

		super.onDefault( object );

		this.splineDebugService.removeControlPoints( object.connection.connectingRoad.spline );

	}

	onUnselected ( object: ManeuverMesh ): void {

		super.onUnselected( object );

		this.splineDebugService.removeControlPoints( object.connection.connectingRoad.spline );

	}

	onAdded ( object: ManeuverMesh ): void {

		this.junctionDebugService.addManeuver( object.junction, object );

	}

	onUpdated ( object: ManeuverMesh ): void {

		this.junctionDebugService.updateManeuver( object );

	}

	onRemoved ( object: ManeuverMesh ): void {

		super.onRemoved( object );

		this.splineDebugService.removeControlPoints( object.connection.connectingRoad.spline );

		this.junctionDebugService.removeManeuver( object.junction, object );

	}

	onClearHighlight (): void {

		this.highlighted.forEach( ( object ) => {

			this.onDefault( object );

		} )

	}

	clear (): void {

		this.splineDebugService.clear();

	}

}
