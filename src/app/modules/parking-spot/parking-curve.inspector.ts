/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { ParkingCurve } from "../../map/parking/parking-curve";
import { AbstractControlPoint } from "../../objects/abstract-control-point";
import { SerializedAction, SerializedField } from "../../core/components/serialization";
import { CommandHistory } from "../../commands/command-history";
import { BakeCurveCommand } from "./commands/bake-curve-command";
import { Commands } from "../../commands/commands";

export class ParkingCurveInspector {

	constructor (
		public parkingCurve: ParkingCurve,
		public controlPoint?: AbstractControlPoint
	) {
	}

	@SerializedField( { type: 'float', min: 1 } )
	get width (): number {
		return this.parkingCurve.getWidth();
	}

	set width ( value: number ) {
		this.parkingCurve.setWidth( value );
	}

	@SerializedField( { type: 'float', min: 1 } )
	get length (): number {
		return this.parkingCurve.getLength();
	}

	set length ( value: number ) {
		this.parkingCurve.setLength( value );
	}

	@SerializedAction( { label: 'Bake Parking Curve' } )
	bake (): void {

		CommandHistory.execute( new BakeCurveCommand( this.parkingCurve.getParkingGraph(), this.parkingCurve ) );

	}

	@SerializedAction( { label: 'Delete Parking Curve' } )
	delete (): void {
		Commands.RemoveObject( this.parkingCurve );
	}

	@SerializedAction( {
		label: 'Delete Control Point',
		validate: function () {
			return this.controlPoint !== undefined;
		} // Using the validation method
	} )
	deleteControlPoint (): void {
		Commands.RemoveObject( this.controlPoint );
	}

}
