/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvJunctionPriority {

	public attr_high: number;
	public attr_low: number;

	constructor ( high: number, low: number ) {
		this.attr_high = high;
		this.attr_low = low;
	}

	get high () {
		return this.attr_high;
	}

	set high ( value: number ) {
		this.attr_high = value;
	}

	get low () {
		return this.attr_low;
	}

	set low ( value: number ) {
		this.attr_low = value;
	}

	clone (): TvJunctionPriority {
		return new TvJunctionPriority( this.attr_high, this.attr_low );
	}
}
