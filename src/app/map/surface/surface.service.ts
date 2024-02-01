/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { DataService } from "../../core/interfaces/data.service";
import { Surface } from "./surface.model";
import { MapService } from "../../services/map/map.service";
import { SurfaceManager } from "./surface.manager";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceService extends DataService<Surface> {

	constructor (
		private mapService: MapService,
		private surfaceManager: SurfaceManager,
	) {
		super();
	}

	all (): Surface[] {

		return this.mapService.map.surfaces;

	}

	add ( object: Surface ) {

		this.mapService.map.addSurface( object );

		this.surfaceManager.onAdded( object );

	}

	update ( object: Surface ): void {

		object.spline.update();

		this.surfaceManager.onUpdated( object );

	}

	remove ( object: Surface ) {

		this.mapService.map.removeSurface( object );

		this.surfaceManager.onRemoved( object );

	}

}
