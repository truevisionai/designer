/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../models/tv-road.model";
import { SerializedAction } from "../../core/components/serialization";
import { CommandHistory } from "../../commands/command-history";
import { SetValueCommand } from "../../commands/set-value-command";

export class TvRoadElevationInspector {

	constructor (
		public road: TvRoad
	) {
	}

	@SerializedAction( { label: 'Increase Elevation' } )
	increase () {

		this.road.elevationProfile.elevation.forEach( elevation => {

			const newValue = elevation.a + 1;

			const oldValue = elevation.a;

			CommandHistory.execute( new SetValueCommand( elevation, 'a', newValue, oldValue ) );

		} );

	}

	@SerializedAction( { label: 'Decrease Elevation' } )
	decrease () {

		this.road.elevationProfile.elevation.forEach( elevation => {

			const newValue = elevation.a - 1;

			const oldValue = elevation.a;

			CommandHistory.execute( new SetValueCommand( elevation, 'a', newValue, oldValue ) );

		} );

	}

}
