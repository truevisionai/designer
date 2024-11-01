/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoad } from "../../map/models/tv-road.model";
import { SerializedAction } from "../../core/components/serialization";
import { Commands } from "app/commands/commands";

export class TvRoadElevationInspector {

	constructor (
		public road: TvRoad
	) {
	}

	@SerializedAction( { label: 'Increase Elevation' } )
	increase (): void {

		this.road.getElevationProfile().getElevations().forEach( elevation => {

			const newValue = elevation.a + 1;

			const oldValue = elevation.a;

			Commands.SetValue( elevation, 'a', newValue, oldValue );

		} );

	}

	@SerializedAction( { label: 'Decrease Elevation' } )
	decrease (): void {

		this.road.getElevationProfile().getElevations().forEach( elevation => {

			const newValue = elevation.a - 1;

			const oldValue = elevation.a;

			Commands.SetValue( elevation, 'a', newValue, oldValue );

		} );

	}

}
