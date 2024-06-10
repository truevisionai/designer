/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { MathUtils } from "three/src/math/MathUtils";

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

	public readonly uuid: string;

	public sOffset = 0;

	public inner = 0;

	public outer = 0;

	/**
	 *
	 * @param sOffset s-coordinate of start position, relative to the position of the preceding <laneSection> element
	 * @param inner Inner offset from road level
	 * @param outer Outer offset from road level
	 */
	constructor ( sOffset: number, inner: number, outer: number ) {

		this.sOffset = sOffset || 0;

		this.inner = inner || 0;

		this.outer = outer || 0;

		this.uuid = MathUtils.generateUUID();

	}

	get s () { return this.sOffset; }

	set s ( value ) { this.sOffset = value; }

	/**
	 * Get the linear value of the lane height at a given t
	 * @param t 0 to 1
	 * @returns
	 */
	getLinearValue ( t: number ) {
		return this.inner + ( this.outer - this.inner ) * t;
	}
}
