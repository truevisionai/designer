/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../models/tv-road.model";
import { Action } from "../../core/components/serialization";
import { CommandHistory } from "../../services/command-history";
import { SetValueCommand } from "../../commands/set-value-command";

export class TvRoadElevationInspector {

	constructor (
		public road: TvRoad
	) {
	}

	@Action( { label: 'Increase Elevation' } )
	increase () {

		this.road.elevationProfile.elevation.forEach( elevation => {

			const newValue = elevation.a + 1;

			const oldValue = elevation.a;

			CommandHistory.execute( new SetValueCommand( elevation, 'a', newValue, oldValue ) );

		} );

	}

	@Action( { label: 'Decrease Elevation' } )
	decrease () {

		this.road.elevationProfile.elevation.forEach( elevation => {

			const newValue = elevation.a - 1;

			const oldValue = elevation.a;

			CommandHistory.execute( new SetValueCommand( elevation, 'a', newValue, oldValue ) );

		} );

	}

}