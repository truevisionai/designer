/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */


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

	toXODR (): Record<string, any> {
		return {
			attr_side: this.attr_side,
			attr_type: this.attr_type,
			attr_width: this.attr_width,
			attr_color: this.attr_color,
		}
	}

}
