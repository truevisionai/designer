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

	private static conversionRates = {
		'm/s': {
			'm/s': 1,
			'km/h': 3.6,
			'mph': 2.23694
		},
		'km/h': {
			'm/s': 0.277778,
			'km/h': 1,
			'mph': 0.621371
		},
		'mph': {
			'm/s': 0.44704,
			'km/h': 1.60934,
			'mph': 1
		}
	};

	constructor (
		public max: number,
		public unit: TvUnit = TvUnit.MILES_PER_HOUR
	) {
	}

	inkmph (): number {
		return this.convertTo( TvUnit.KM_PER_HOUR );
	}

	convertTo ( unit: TvUnit ): number {

		if ( TvRoadSpeed.conversionRates[ this.unit ] && TvRoadSpeed.conversionRates[ this.unit ][ unit ] ) {

			// Convert speed from current unit to target unit
			return Number( ( this.max * TvRoadSpeed.conversionRates[ this.unit ][ unit ] ).toFixed( 2 ) );

		} else {

			console.error( `Conversion from ${ this.unit } to ${ unit } not supported` );
			return this.max;
		}
	}
}
