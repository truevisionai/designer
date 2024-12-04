/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvLane } from "../tv-lane";
import { Maths } from "../../../utils/maths";

export class TvObjectRepeat {

	public targetLane?: TvLane;

	public lengthStart?: number;

	public lengthEnd?: number;

	/**
	 *
	 * @param sStart s-coordinate of start position, overrides the corresponding argument in the original <object> record
	 * @param segmentLength Length of the repeat area, along the reference line in s-direction.
	 * @param gap Distance between two instances of the object; If this value is zero, then the object is treated like a continuous feature, for example, a guard rail, a wall, etc.
	 * @param tStart Lateral offset of objects reference point at @s
	 * @param tEnd Lateral offset of object’s reference point at @s + @length
	 * @param widthStart
	 * @param widthEnd
	 * @param heightStart
	 * @param heightEnd
	 * @param zOffsetStart
	 * @param zOffsetEnd
	 */
	constructor (
		public sStart: number,
		public segmentLength: number,
		public gap: number,
		public tStart?: number,
		public tEnd?: number,
		public widthStart?: number,
		public widthEnd?: number,
		public heightStart?: number,
		public heightEnd?: number,
		public zOffsetStart?: number,
		public zOffsetEnd?: number
	) {
	}

	clone (): TvObjectRepeat {

		return new TvObjectRepeat(
			this.sStart,
			this.segmentLength,
			this.gap,
			this.tStart,
			this.tEnd,
			this.widthStart,
			this.widthEnd,
			this.heightStart,
			this.heightEnd,
			this.zOffsetStart,
			this.zOffsetEnd
		);
	}

	/**
	 *
	 * @param segmentLength
	 * @param roadLength
	 * @returns
	 * @deprecated
	 */
	static calculateLength ( segmentLength: number, roadLength?: number ): number {

		if ( !roadLength ) {
			return segmentLength;
		}

		if ( !segmentLength ) {
			return roadLength;
		}

		if ( segmentLength == -1 ) {
			return roadLength;
		}

		if ( segmentLength == 0 ) {
			return roadLength;
		}

		return segmentLength;
	}

	computeLength ( roadLength?: number ): number {

		let actualLength = roadLength;

		if ( !roadLength ) {

			actualLength = this.segmentLength;

		} else if ( !this.segmentLength ) {

			actualLength = roadLength - this.sStart

		} else if ( this.segmentLength == -1 ) {

			actualLength = roadLength - this.sStart;

		} else if ( this.segmentLength == 0 ) {

			actualLength = roadLength - this.sStart;

		} else {

			actualLength = this.segmentLength;

		}

		if ( roadLength ) {
			actualLength = Maths.clamp( actualLength, 0, roadLength );
		}

		return actualLength;

	}
}
