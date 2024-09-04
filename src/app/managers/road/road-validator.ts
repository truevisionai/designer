/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Injectable } from '@angular/core';
import { TvRoad } from 'app/map/models/tv-road.model';
import { RoadLinkValidator } from './road-link-validator';
import { Log } from 'app/core/utils/log';

@Injectable( {
	providedIn: 'root'
} )
export class RoadValidator {

	private enabled = true;

	constructor (
		private roadLinkValidator: RoadLinkValidator,
	) { }

	validateRoad ( road: TvRoad ): void {

		if ( !this.enabled ) return;

		if ( road.isJunction ) return;

		try {

			this.roadLinkValidator.validateLinks( road );

		} catch ( e ) {

			Log.error( 'RoadValidationException', e.message );

		}

	}

}
