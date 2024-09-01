/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeVisualizer } from "app/core/overlay-handlers/node-visualizer";
import { Log } from "app/core/utils/log";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { RoadControlPoint } from "app/objects/road-control-point";
import { RoadTangentPoint } from "app/objects/road-tangent-point";
import { SplineControlPoint } from "app/objects/spline-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class PointVisualizer<T extends AbstractControlPoint> extends NodeVisualizer<T> {

	onAdded ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	onUpdated ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	onRemoved ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	protected updateSpline ( object: AbstractControlPoint ): void {

		if ( object instanceof SplineControlPoint ) {

			this.updateVisuals( object.spline );

		} else if ( object instanceof RoadControlPoint ) {

			this.updateVisuals( object.spline );

		} else if ( object instanceof RoadTangentPoint ) {

			this.updateVisuals( object.spline );

		} else {

			Log.error( 'Unknown control point type', object );

		}

	}

}

@Injectable( {
	providedIn: 'root'
} )
export class ManeuverPointVisualizer extends PointVisualizer<AbstractControlPoint> {

	protected updateSpline ( object: AbstractControlPoint ): void {
		// do nothing
	}

}
