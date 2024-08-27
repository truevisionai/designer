/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseOverlayHandler } from "app/core/overlay-handlers/base-overlay-handler";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { SplineDebugService } from "app/services/debug/spline-debug.service";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverOverlayHandler extends BaseOverlayHandler<ManeuverMesh> {

	constructor (
		private junctionDebugService: JunctionDebugService,
		private splineDebugService: SplineDebugService
	) {
		super();
	}

	onHighlight ( object: ManeuverMesh ): void {

		object.highlight();


	}

	onSelected ( object: ManeuverMesh ): void {

		object.select();

		this.splineDebugService.showControlPoints( object.connection.connectingRoad.spline );

	}

	onDefault ( object: ManeuverMesh ): void {

		object.unselect();

		this.splineDebugService.removeControlPoints( object.connection.connectingRoad.spline );

	}

	onUnselected ( object: ManeuverMesh ): void {

		object.unselect();

		this.splineDebugService.removeControlPoints( object.connection.connectingRoad.spline );

	}

	onAdded ( object: ManeuverMesh ): void {

		this.junctionDebugService.addManeuver( object.junction, object );

	}

	onUpdated ( object: ManeuverMesh ): void {

		this.junctionDebugService.updateManeuver( object );

	}

	onRemoved ( object: ManeuverMesh ): void {

		object.unselect();

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
