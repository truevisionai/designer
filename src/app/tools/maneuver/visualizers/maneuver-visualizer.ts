/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "app/core/visualizers/node-visualizer";
import { JunctionDebugService } from "app/services/junction/junction.debug";
import { ManeuverMesh } from 'app/services/junction/maneuver-mesh';
import { SplineDebugService } from "app/services/debug/spline-debug.service";

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverVisualizer extends NodeVisualizer<ManeuverMesh> {

	constructor (
		private junctionDebugService: JunctionDebugService,
		private splineDebugService: SplineDebugService,
	) {
		super();
	}

	onSelected ( object: ManeuverMesh ): void {

		super.onSelected( object );

		this.splineDebugService.showReferenceLine( object.connection.getSpline() );
		this.splineDebugService.showControlPoints( object.connection.getSpline() );

	}

	onDefault ( object: ManeuverMesh ): void {

		super.onDefault( object );

	}

	onUnselected ( object: ManeuverMesh ): void {

		super.onUnselected( object );

		this.splineDebugService.removeReferenceLine( object.connection.getSpline() );
		this.splineDebugService.removeControlPoints( object.connection.getSpline() );

	}

	onAdded ( object: ManeuverMesh ): void {

		super.onAdded( object );

		this.junctionDebugService.addManeuver( object.junction, object );

	}

	onUpdated ( object: ManeuverMesh ): void {

		super.onUpdated( object );

		this.junctionDebugService.updateManeuver( object );

	}

	onRemoved ( object: ManeuverMesh ): void {

		super.onRemoved( object );

		this.splineDebugService.removeReferenceLine( object.connection.getSpline() );
		this.splineDebugService.removeControlPoints( object.connection.getSpline() );

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
