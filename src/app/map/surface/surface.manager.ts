/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from '../../services/map/map.service';
import { SurfaceBuilder } from 'app/map/surface/surface.builder';
import { Surface } from 'app/map/surface/surface.model';
import { Manager } from "../../core/interfaces/manager";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceManager extends Manager {

	constructor (
		private mapService: MapService,
		private surfaceBuilder: SurfaceBuilder,
	) {
		super();
	}

	init (): void {

		// this.mapService.map.surfaces.forEach( surface => this.onAdded( surface ) );

	}

	onAdded ( surface: Surface ) {

		const mesh = this.surfaceBuilder.buildMesh( surface );

		this.mapService.map.surfaceGroup.add( surface, mesh );

	}

	onRemoved ( surface: Surface ) {

		this.mapService.map.surfaceGroup.remove( surface );

	}

	onUpdated ( surface: Surface ) {

		const mesh = this.surfaceBuilder.buildMesh( surface );

		this.mapService.map.surfaceGroup.add( surface, mesh );

	}

}
