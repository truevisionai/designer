/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

export class TvLaneValidity {

	// NOTE: For single-lane-validity of the object, provide identical values for fromLane and toLane.

	// minimum ID of the lanes for which the object is valid
	public fromLane: number;

	// maximum ID of the lanes for which the object is valid
	public toLane: number;

	constructor ( from: number, to: number ) {
		this.fromLane = from;
		this.toLane = to;
	}

	clone (): TvLaneValidity {
		return new TvLaneValidity(
			this.fromLane,
			this.toLane
		);
	}

}
