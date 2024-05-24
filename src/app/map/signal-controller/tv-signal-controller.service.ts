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

		this.mapService.map.controllers.delete( id );

		this.mapService.map.controllerIds.remove( id );

	}

	addController ( controller: TvSignalController ) {

		this.mapService.map.addController( controller );

	}
}
