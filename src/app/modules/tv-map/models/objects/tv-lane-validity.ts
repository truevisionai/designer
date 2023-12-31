export class TvLaneValidity {

	// NOTE: For single-lane-validity of the object, provide identical values for fromLane and toLane.

	// minimum ID of the lanes for which the object is valid
	public attr_fromLane: number;

	// maximum ID of the lanes for which the object is valid
	public attr_toLane: number;

	constructor ( from: number, to: number ) {
		this.attr_fromLane = from;
		this.attr_toLane = to;
	}

	clone (): TvLaneValidity {
		return new TvLaneValidity(
			this.attr_fromLane,
			this.attr_toLane
		);
	}

}
