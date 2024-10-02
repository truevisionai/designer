/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { BaseDataService } from "../../core/interfaces/data.service";
import { Surface } from "./surface.model";
import { MapService } from "../../services/map/map.service";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { SplineService } from "../../services/spline/spline.service";
import { Mesh } from "three";
import { MapEvents } from "app/events/map-events";
import { SplineGeometryGenerator } from "app/services/spline/spline-geometry-generator";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceService extends BaseDataService<Surface> {

	constructor (
		private mapService: MapService,
		private splineService: SplineService,
		private splineBuilder: SplineGeometryGenerator,
	) {
		super();
	}

	all (): Surface[] {

		return this.mapService.map.getSurfaces();

	}

	add ( object: Surface ) {

		this.mapService.map.addSurface( object );

		this.splineBuilder.buildNew( object.spline );

		MapEvents.surfaceAdded.emit( object );

	}

	update ( object: Surface ): void {

		this.splineBuilder.buildNew( object.spline );

		MapEvents.surfaceUpdated.emit( object );

	}

	remove ( object: Surface ) {

		this.mapService.map.removeSurface( object );

		MapEvents.surfaceRemoved.emit( object );

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
