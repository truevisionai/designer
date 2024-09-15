/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CreationStrategy, ValidationPassed, ValidationResult } from "../../../core/interfaces/creation-strategy";
import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { SelectionService } from "../../selection.service";
import { SurfaceFactory } from "app/map/surface/surface.factory";
import { Surface } from "app/map/surface/surface.model";
import { AbstractControlPoint } from "app/objects/abstract-control-point";

@Injectable( {
	providedIn: 'root'
} )
export class SurfacePointCreationStrategy implements CreationStrategy<Surface | AbstractControlPoint> {

	constructor (
		private selectionService: SelectionService,
		private surfaceFactory: SurfaceFactory,
	) { }

	validate ( event: PointerEventData ): ValidationResult {

		return new ValidationPassed();

	}

	createObject ( event: PointerEventData ): Surface | AbstractControlPoint {

		const selectedSurface = this.getSelectedSurface();

		if ( selectedSurface ) {

			const surface = this.getSelectedSurface();

			const point = SurfaceFactory.createSurfacePoint( event.point, surface );

			return point;

		} else {

			const surface = this.surfaceFactory.createSurface();

			const point = SurfaceFactory.createSurfacePoint( event.point, surface );

			surface.spline.addControlPoint( point );

			return surface;

		}

	}

	private getSelectedSurface (): Surface | undefined {

		return this.selectionService.findSelectedObject<Surface>( Surface );

	}

}
