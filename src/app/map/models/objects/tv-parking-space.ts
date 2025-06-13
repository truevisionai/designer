/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvParkingSpaceAccess } from "../tv-common";
import { TvParkingSpaceMarking } from "./tv-parking-space-marking";

export class TvParkingSpace {

	public attr_access: TvParkingSpaceAccess;
	public attr_restriction: string;

	// MAX 4 ENTRIES ALLOWED
	public marking: TvParkingSpaceMarking[] = [];

	getMarkingCount (): number {
		return this.marking.length;
	}

	getMarkingList (): TvParkingSpaceMarking[] {
		return this.marking;
	}

	getMarking ( i: number ): TvParkingSpaceMarking {
		return this.marking[ i ];
	}

	clone (): TvParkingSpace {

		const clone = new TvParkingSpace();

		clone.attr_access = this.attr_access;

		clone.attr_restriction = this.attr_restriction;

		this.marking.forEach( marking => {

			clone.marking.push( marking.clone() );

		} );

		return clone;

	}

	toXODR (): Record<string, any> {
		return {
			attr_access: this.attr_access,
			attr_restriction: this.attr_restriction,
			marking: this.marking.map( marking => marking.toXODR() ),
		};
	}


}
