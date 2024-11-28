/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvRoadType, TvUnit } from './tv-common';
import { TvRoadSpeed } from "./tv-road.speed";

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

	static stringToTypes ( value: string ): TvRoadType {

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

	static typeToString ( value: TvRoadType ): string {

		if ( value === TvRoadType.UNKNOWN ) return 'unknown';
		if ( value === TvRoadType.RURAL ) return 'rural';
		if ( value === TvRoadType.MOTORWAY ) return 'motorway';
		if ( value === TvRoadType.TOWN ) return 'town';
		if ( value === TvRoadType.LOW_SPEED ) return 'lowSpeed';
		if ( value === TvRoadType.PEDESTRIAN ) return 'pedestrian';
		if ( value === TvRoadType.BICYCLE ) return 'bicycle';

		return 'unknown';

	}

	clone (): TvRoadTypeClass {
		return new TvRoadTypeClass( this.s, this.type, this.speed.max, this.speed.unit );
	}

}

