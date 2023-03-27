/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadType, TvUnit } from './tv-common';


export class TvRoadTypeClass {

	public readonly speed: TvRoadSpeed;

	constructor (
		public s: number,
		public type: TvRoadType,
		maxSpeed: number = 40,
		speedUnit: TvUnit = TvUnit.MILES_PER_HOUR
	) {
		this.speed = new TvRoadSpeed( maxSpeed, speedUnit );
	}

	static stringToTypes ( value ): TvRoadType {

		if ( value === 'unknown' ) {

			return TvRoadType.UNKNOWN;

		} else if ( value === 'rural' ) {

			return TvRoadType.RURAL;

		} else if ( value === 'motorway' ) {

			return TvRoadType.MOTORWAY;

		} else if ( value === 'town' ) {

			return TvRoadType.TOWN;

		} else if ( value === 'lowSpeed' ) {

			return TvRoadType.LOW_SPEED;

		} else if ( value === 'pedestrian' ) {

			return TvRoadType.PEDESTRIAN;

		} else if ( value === 'bicycle' ) {

			return TvRoadType.BICYCLE;

		} else {

			// console.error( "Unknown value for road type" );

			return TvRoadType.UNKNOWN;
		}

	}
}

export class TvRoadSpeed {

	constructor (
		public max: number,
		public unit: TvUnit
	) {
	}

	inkmph (): number {

		console.error( 'converionf from mph to kmph not happening' );

		return this.max;

	}
}
