/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { PointSelectionStrategy } from "app/core/strategies/select-strategies/control-point-strategy";
import { ObjectUserDataStrategy } from "app/core/strategies/select-strategies/object-user-data-strategy";
import { Surface } from "app/map/surface/surface.model";
import { SimpleControlPointDragHandler } from "app/core/drag-handlers/point-drag-handler.service";

export class SurfacePointSelectionStrategy extends PointSelectionStrategy {
	constructor () {
		super();
	}
}

export class SurfaceSelectionStrategy extends ObjectUserDataStrategy<Surface> {
	constructor () {
		super( Surface.tag, 'surface' );
	}
}


@Injectable()
export class SurfacePointDragHandler extends SimpleControlPointDragHandler<Surface> {
}
