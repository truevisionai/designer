/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Commands } from "app/commands/commands";
import { SerializedField, SerializedAction } from "app/core/components/serialization";
import { Maths } from "app/utils/maths";
import { TvRoad } from "../../map/models/tv-road.model";
import { TvElevation } from "../../map/road-elevation/tv-elevation.model";

export class TvElevationInspector {

	constructor (
		public road: TvRoad,
		public elevation: TvElevation
	) {
	}

	@SerializedField( { type: 'int' } )
	get s (): number {

		return this.elevation.s;

	}

	set s ( value: number ) {

		this.elevation.s = value;

	}

	@SerializedField( { type: 'int' } )
	get height (): number {

		return this.elevation.a;

	}

	set height ( value: number ) {

		this.elevation.a = value;

	}

	@SerializedAction( { label: 'Increase Elevation' } )
	increase (): void {

		const newValue = this.elevation.a + 1;

		const oldValue = this.elevation.a;

		Commands.SetValue( this.elevation, 'a', newValue, oldValue );

	}

	@SerializedAction( { label: 'Decrease Elevation' } )
	decrease (): void {

		const newValue = this.elevation.a - 1;

		const oldValue = this.elevation.a;

		Commands.SetValue( this.elevation, 'a', newValue, oldValue );

	}

	@SerializedAction()
	delete (): void {

		if ( Maths.approxEquals( this.s, 0 ) ) {

			return;

		} else {

			Commands.RemoveObject( this.elevation );

		}
	}

}
