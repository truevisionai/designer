/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseObjectHandler } from "./base-object-handler";
import { AutoSpline } from "../shapes/auto-spline-v2";
import { Vector3 } from "three";
import { SplineService } from "../../services/spline/spline.service";
import { PointerEventData } from "../../events/pointer-event-data";
import { SplineUtils } from "../../utils/spline.utils";
import { Commands } from "../../commands/commands";
import { SplineGeometryService } from "app/services/spline/spline-geometry.service";
import { ToolManager } from "app/managers/tool-manager";

@Injectable( {
	providedIn: 'root'
} )
export class SplineHandler extends BaseObjectHandler<AutoSpline> {

	private dragStartPosition: Vector3;

	private dragLastPosition: Vector3;

	constructor (
		private splineService: SplineService,
		private splineGeometryService: SplineGeometryService
	) {
		super();
	}

	onAdded ( object: AutoSpline ): void {

		this.splineService.add( object );

	}

	onUpdated ( object: AutoSpline ): void {

		this.splineService.update( object );

	}

	onRemoved ( object: AutoSpline ): void {

		this.splineService.remove( object );

	}

	onDrag ( object: AutoSpline, e: PointerEventData ): void {

		if ( SplineUtils.isConnectedToJunction( object ) ) {
			this.setHint( 'Moving spline connected with junction is not supported. Add control points to modify spline.' );
			return;
		}

		if ( !this.dragStartPosition ) this.dragStartPosition = e.point.clone();

		if ( !this.dragLastPosition ) this.dragLastPosition = e.point.clone();

		const delta = e.point.clone().sub( this.dragLastPosition );

		object.getControlPoints().forEach( point => {

			point.position.add( delta );

		} );

		// Update the start position for the next drag event
		this.dragLastPosition.copy( e.point );

		this.splineGeometryService.updateGeometryAndBounds( object );

		ToolManager.getTool().onUpdateOverlay( object );

	}

	onDragEnd ( object: AutoSpline, e: PointerEventData ): void {

		if ( !this.dragStartPosition || !this.dragLastPosition ) return;

		const delta = this.dragStartPosition.clone().sub( this.dragLastPosition );

		Commands.DragSpline( object, delta );

		this.dragLastPosition = this.dragStartPosition = null;

	}

}
