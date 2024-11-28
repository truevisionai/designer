/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointerEventData } from "app/events/pointer-event-data";
import { SurfaceFactory } from "app/map/surface/surface.factory";
import { Surface } from "app/map/surface/surface.model";
import { AbstractControlPoint } from "app/objects/abstract-control-point";
import { FreeValidationCreationStrategy } from "app/core/interfaces/base-creation-strategy";
import { SimpleControlPoint } from "app/objects/simple-control-point";

@Injectable()
export class SurfacePointCreationStrategy extends FreeValidationCreationStrategy<AbstractControlPoint> {

	constructor ( private surfaceFactory: SurfaceFactory ) {

		super();

	}

	canCreate ( event: PointerEventData, lastSelected?: Surface | SimpleControlPoint<Surface> | null ): boolean {

		return lastSelected instanceof Surface || lastSelected instanceof SimpleControlPoint;

	}

	createObject ( event: PointerEventData, lastSelected?: Surface | SimpleControlPoint<Surface> ): AbstractControlPoint {

		const surface = this.getSurface( lastSelected );

		const point = SurfaceFactory.createSurfacePoint( event.point, surface );

		return point;

	}

	getSurface ( lastSelected: Surface | SimpleControlPoint<Surface> ): Surface {

		if ( lastSelected instanceof Surface ) {

			return lastSelected;

		} else if ( lastSelected instanceof SimpleControlPoint ) {

			return lastSelected.mainObject;

		} else {

			return this.surfaceFactory.createSurface();

		}

	}

}


@Injectable( {
	providedIn: 'root'
} )
export class SurfaceCreationStrategy extends FreeValidationCreationStrategy<Surface> {

	constructor ( private surfaceFactory: SurfaceFactory ) {

		super();

	}

	canCreate ( event: PointerEventData, lastSelected?: Surface | SimpleControlPoint<Surface> | null ): boolean {

		// If the last selected object is a surface or no object is selected,
		// then we can create a new surface
		return lastSelected instanceof Surface || !lastSelected;

	}

	createObject ( event: PointerEventData ): Surface {

		const surface = this.surfaceFactory.createSurface();

		const point = SurfaceFactory.createSurfacePoint( event.point, surface );

		surface.addControlPoint( point );

		return surface;

	}

}
