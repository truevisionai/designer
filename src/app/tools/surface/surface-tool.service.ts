/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { Surface } from 'app/map/surface/surface.model';
import { SurfaceBuilder } from 'app/map/surface/surface.builder';
import { MapService } from 'app/services/map/map.service';
import { Mesh } from "three";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceToolService {

	constructor (
		private surfaceBuilder: SurfaceBuilder,
		private mapService: MapService
	) {
	}

	getSurfaceMesh ( object: Surface ) {

		return this.mapService.map.surfaceGroup.get( object ) as Mesh;

	}

	private removeMesh ( surface: Surface ) {

		this.mapService.map.surfaceGroup.remove( surface );

	}

	updateSurfaceMeshByDimensions ( surface: Surface, width: number, height: number ) {

		this.removeMesh( surface );

		// if surface is a rectangle
		if ( surface.spline?.controlPoints.length == 4 ) {

			surface.spline.controlPoints[ 0 ].position.set( 0, 0, 0 );
			surface.spline.controlPoints[ 1 ].position.set( width, 0, 0 );
			surface.spline.controlPoints[ 2 ].position.set( width, height, 0 );
			surface.spline.controlPoints[ 3 ].position.set( 0, height, 0 );

			surface.repeat.set( 1 / width, 1 / height );
		}

		const mesh = this.surfaceBuilder.buildMesh( surface );

		this.mapService.map.surfaceGroup.add( surface, mesh );

	}

}
