/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { MapService } from 'app/services/map/map.service';
import { TvSignalController } from './tv-signal-controller';

@Injectable( {
	providedIn: 'root'
} )
export class TvSignalControllerFactory {

	constructor ( private mapService: MapService ) { }

	createNewController () {

		const id = this.mapService.map.getControllerCount();

		const name = `Controller${ id }`;

		return new TvSignalController( id, name );
	}
}
