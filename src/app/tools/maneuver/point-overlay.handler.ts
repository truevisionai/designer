/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { NodeOverlayHandler } from "app/core/overlay-handlers/node-overlay-handler";
import { Log } from "app/core/utils/log";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { RoadControlPoint } from "app/objects/road-control-point";
import { RoadTangentPoint } from "app/objects/road-tangent-point";
import { SplineControlPoint } from "app/objects/spline-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class PointOverlayHandler<T extends AbstractControlPoint> extends NodeOverlayHandler<T> {

	onAdded ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	onUpdated ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	onRemoved ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	private updateSpline ( object: AbstractControlPoint ): void {

		if ( object instanceof SplineControlPoint ) {

			this.updateOverlay( object.spline );

		} else if ( object instanceof RoadControlPoint ) {

			this.updateOverlay( object.spline );

		} else if ( object instanceof RoadTangentPoint ) {

			this.updateOverlay( object.spline );

		} else {

			Log.error( 'Unknown control point type', object );

		}

	}

}
