/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvLaneHeight {
	public attr_sOffset = 0;
	public attr_inner = 0;
	public attr_outer = 0;

	constructor ( sOffset: number, inner: number, outer: number ) {
		this.attr_sOffset = sOffset || 0;
		this.attr_inner = inner || 0;
		this.attr_outer = outer || 0;
	}

	get sOffset () {
		return this.attr_sOffset;
	}

	set sOffset ( value ) {
		this.attr_sOffset = value;
	}

	get outer () {
		return this.attr_outer;
	}

	get inner () {
		return this.attr_inner;
	}

	getOuter () {
		return this.attr_outer;
	}

	setOuter ( value: number ) {
		this.attr_outer = value;
	}

	getInner () {
		return this.attr_inner;
	}

	setInner ( value : number) {
		this.attr_inner = value;
	}

}
