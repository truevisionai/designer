/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseOverlayHandler } from "app/core/overlay-handlers/base-overlay-handler";
import { Log } from "app/core/utils/log";
import { ToolManager } from "app/managers/tool-manager";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { RoadControlPoint } from "app/objects/road-control-point";
import { RoadTangentPoint } from "app/objects/road-tangent-point";
import { SplineControlPoint } from "app/objects/spline-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class PointOverlayHandler extends BaseOverlayHandler<AbstractControlPoint> {

	constructor () {
		super();
	}

	onHighlight ( object: AbstractControlPoint ): void {

		object.onMouseOver();

	}

	onSelected ( object: AbstractControlPoint ): void {

		object.select();

	}

	onDefault ( object: AbstractControlPoint ): void {

		object.unselect();

	}

	onUnselected ( object: AbstractControlPoint ): void {

		object.unselect();

	}

	onAdded ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	onUpdated ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	onRemoved ( object: AbstractControlPoint ): void {

		this.updateSpline( object );

	}

	onClearHighlight (): void {

		//

	}

	clear (): void {

		//

	}

	private updateSpline ( object: AbstractControlPoint ): void {

		if ( object instanceof SplineControlPoint ) {

			ToolManager.getTool()?.onUpdateOverlay( object.spline );

		} else if ( object instanceof RoadControlPoint ) {

			ToolManager.getTool()?.onUpdateOverlay( object.spline );

		} else if ( object instanceof RoadTangentPoint ) {

			ToolManager.getTool()?.onUpdateOverlay( object.spline );

		} else {

			Log.error( 'Unknown control point type', object );

		}

	}

}
