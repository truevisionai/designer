/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { Maths } from "app/utils/maths";
import { MathUtils } from "three/src/math/MathUtils";
import { TvLane } from "../models/tv-lane";

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

	get s () {
		return this.sOffset;
	}

	set s ( value ) {
		this.sOffset = value;
	}

	/**
	 * Get the linear value of the lane height at a given t
	 * @param t 0 to 1
	 * @returns
	 */
	getLinearValue ( t: number ): number {
		return this.inner + ( this.outer - this.inner ) * t;
	}

	matches ( laneHeight: TvLaneHeight ): boolean {

		if ( !Maths.approxEquals( this.inner, laneHeight.inner ) ) return false;
		if ( !Maths.approxEquals( this.outer, laneHeight.outer ) ) return false;

		return true;

	}

	copyHeight ( other: TvLaneHeight ): void {
		this.inner = other.inner;
		this.outer = other.outer;
	}

	setHeight ( value: number ): void {
		this.inner = value;
		this.outer = value;
	}

	clone (): TvLaneHeight {
		return new TvLaneHeight( this.sOffset, this.inner, this.outer );
	}

}


export class LaneHeightProfile {

	private height: TvLaneHeight[] = [];

	constructor ( private lane: TvLane ) {
	}

	getArray (): TvLaneHeight[] {

		return this.height;

	}

	getIndexByDistance ( sOffset: number ): number {

		let res = -1;

		for ( let i = 0; i < this.height.length; i++ ) {

			if ( sOffset >= this.height[ i ].sOffset ) {

				res = i;

			} else {

				break;

			}

		}

		return res;

	}

	createAndAddHeight ( sOffset: number, inner: number, outer: number ): void {

		this.addHeight( new TvLaneHeight( sOffset, inner, outer ) );

	}

	addHeight ( height: TvLaneHeight ): void {

		// Center lane should not have height
		if ( this.lane.isCenter ) return;

		const index = this.getIndexByDistance( height.sOffset ) + 1;

		if ( index > this.getHeightCount() ) {

			this.height.push( height );

		} else {

			this.height[ index ] = height;

		}

		this.height.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	getHeightCount (): number {

		return this.height.length;

	}

	getHeightByIndex ( index: number ): TvLaneHeight | undefined {

		if ( this.height.length > 0 && index < this.height.length ) {

			return this.height[ index ];

		}

	}

	clear (): void {

		this.height.splice( 0, this.height.length );

	}

	getHeightValue ( sOffset: number ): TvLaneHeight {

		const height = new TvLaneHeight( sOffset, 0, 0 );

		const index = this.getIndexByDistance( sOffset );

		if ( index >= 0 ) {

			height.copyHeight( this.getHeightByIndex( index ) );

		}

		return height;

	}
}
