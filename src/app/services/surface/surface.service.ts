/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from "@angular/core";
import { DataService } from "../debug/data.service";
import { TvSurface } from "../../map/models/tv-surface.model";
import { MapService } from "../map/map.service";

@Injectable( {
	providedIn: 'root'
} )
export class SurfaceService extends DataService<TvSurface> {

	constructor ( private mapService: MapService ) {
		super();
	}

	all (): TvSurface[] {
		return this.mapService.map.surfaces;
	}

	add ( object: TvSurface ) {
		this.mapService.map.addSurface( object );
	}

	update ( object: TvSurface ): void {
		// this.mapService.map.updateSurface( object );
	}

	remove ( object: TvSurface ) {
		this.mapService.map.removeSurface( object );
	}

}
