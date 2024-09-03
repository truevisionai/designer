/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { SplineDebugService } from "app/services/debug/spline-debug.service";
import { EmptyVisualizer } from "app/core/overlay-handlers/empty-visualizer";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverVisualizer extends NodeVisualizer<ManeuverMesh> {

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

		this.updateVisuals( object.junction );

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

		this.junctionDebugService.clear();

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverVisualizerTrafficLight extends EmptyVisualizer<ManeuverMesh> {


}
