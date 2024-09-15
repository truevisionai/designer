/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDataService } from "../../core/interfaces/data.service";
import { Surface } from "./surface.model";
import { MapService } from "../../services/map/map.service";
import { SurfaceManager } from "./surface.manager";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { SplineService } from "../../services/spline/spline.service";
import { Mesh } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceService extends BaseDataService<Surface> {

	constructor (
		private mapService: MapService,
		private surfaceManager: SurfaceManager,
		private splineService: SplineService,
	) {
		super();
	}

	all (): Surface[] {

		return this.mapService.map.getSurfaces();

	}

	add ( object: Surface ) {

		this.mapService.map.addSurface( object );

		this.surfaceManager.onAdded( object );

	}

	update ( object: Surface ): void {

		this.surfaceManager.onUpdated( object );

	}

	remove ( object: Surface ) {

		this.mapService.map.removeSurface( object );

		this.surfaceManager.onRemoved( object );

	}

	addPoint ( object: Surface, point: AbstractControlPoint ) {

		const index = this.splineService.findIndex( object.spline, point.position );

		object.spline.controlPoints.splice( index, 0, point );

		this.splineService.updatePointHeading( object.spline, point, index );

		this.splineService.updateIndexes( object.spline );

		this.update( object );

	}

	getSurfaceMesh ( object: Surface ): Mesh {

		return this.mapService.map.surfaceGroup.get( object ) as Mesh;

	}

}
