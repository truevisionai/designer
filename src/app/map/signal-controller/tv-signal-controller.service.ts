/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from "../../services/map/map.service";
import { TvSignalController } from "./tv-signal-controller";

@Injectable( {
	providedIn: 'root'
} )
export class TvSignalControllerService {

	constructor ( private mapService: MapService ) {
	}

	removeController ( id: number ) {

		this.mapService.map.removeController( id );

	}

	addController ( controller: TvSignalController ) {

		this.mapService.map.addController( controller );

	}
}
