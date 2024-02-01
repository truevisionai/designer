import { TvRoad } from "../models/tv-road.model";
import { TvElevation } from "./tv-elevation.model";
import { Action, SerializedField } from "../../core/components/serialization";
import { CommandHistory } from "../../services/command-history";
import { SetValueCommand } from "../../commands/set-value-command";
import { Maths } from "../../utils/maths";
import { RemoveObjectCommand } from "../../commands/remove-object-command";

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

	@Action( { label: 'Increase Elevation' } )
	increase () {

		const newValue = this.elevation.a + 1;

		const oldValue = this.elevation.a;

		CommandHistory.execute( new SetValueCommand( this.elevation, 'a', newValue, oldValue ) );

	}

	@Action( { label: 'Decrease Elevation' } )
	decrease () {

		const newValue = this.elevation.a - 1;

		const oldValue = this.elevation.a;

		CommandHistory.execute( new SetValueCommand( this.elevation, 'a', newValue, oldValue ) );

	}

	@Action()
	delete () {

		if ( Maths.approxEquals( this.s, 0 ) ) {

			return;

		} else {

			CommandHistory.execute( new RemoveObjectCommand( this.elevation ) );
		}
	}

}