/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

/**

Rules
The following rules apply to lane height:
To modify the lane height, for example for curbstones, the <height> element shall be used.
<height> elements shall be defined in ascending order according to the s-coordinate.
The center lane shall not be elevated by lane height.
Lane height shall not be used to define road elevation or superelevation.
Lane height shall be used for small scale elevation only.

 */
export class TvLaneHeight {

	private _sOffset = 0;
	private _inner = 0;
	private _outer = 0;

	/**
	 *
	 * @param sOffset s-coordinate of start position, relative to the position of the preceding <laneSection> element
	 * @param inner Inner offset from road level
	 * @param outer Outer offset from road level
	 */
	constructor ( sOffset: number, inner: number, outer: number ) {
		this._sOffset = sOffset || 0;
		this._inner = inner || 0;
		this._outer = outer || 0;
	}

	get sOffset () {
		return this._sOffset;
	}

	set sOffset ( value ) {
		this._sOffset = value;
	}

	get s () {
		return this._sOffset;
	}

	set s ( value ) {
		this._sOffset = value;
	}

	get outer () {
		return this._outer;
	}

	get inner () {
		return this._inner;
	}

	getOuter () {
		return this._outer;
	}

	setOuter ( value: number ) {
		this._outer = value;
	}

	getInner () {
		return this._inner;
	}

	setInner ( value: number ) {
		this._inner = value;
	}

}
