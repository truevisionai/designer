import { TvColors, TvParkingSpaceMarkingSides, TvRoadMarkTypes } from "../tv-common";

export class TvParkingSpaceMarking {

	constructor (
		public attr_side: TvParkingSpaceMarkingSides,
		public attr_type: TvRoadMarkTypes,
		public attr_width: number,
		public attr_color: TvColors,
	) {
	}

	clone (): TvParkingSpaceMarking {
		return new TvParkingSpaceMarking(
			this.attr_side,
			this.attr_type,
			this.attr_width,
			this.attr_color
		);
	}

}
