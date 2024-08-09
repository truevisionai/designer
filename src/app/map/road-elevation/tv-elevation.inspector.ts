/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { CommandHistory } from "app/commands/command-history";
import { Commands } from "app/commands/commands";
import { RemoveObjectCommand } from "app/commands/remove-object-command";
import { SerializedField, SerializedAction } from "app/core/components/serialization";
import { Maths } from "app/utils/maths";
import { TvRoad } from "../models/tv-road.model";
import { TvElevation } from "./tv-elevation.model";

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
	increase () {

		const newValue = this.elevation.a + 1;

		const oldValue = this.elevation.a;

		Commands.SetValue( this.elevation, 'a', newValue, oldValue );

	}

	@SerializedAction( { label: 'Decrease Elevation' } )
	decrease () {

		const newValue = this.elevation.a - 1;

		const oldValue = this.elevation.a;

		Commands.SetValue( this.elevation, 'a', newValue, oldValue );

	}

	@SerializedAction()
	delete () {

		if ( Maths.approxEquals( this.s, 0 ) ) {

			return;

		} else {

			Commands.RemoveObject( this.elevation );

		}
	}

}
