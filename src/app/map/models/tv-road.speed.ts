import { TvUnit } from "./tv-common";

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

	static unitToString ( unit: TvUnit ): string {

		if ( unit === TvUnit.METER ) return 'm';
		if ( unit === TvUnit.KM ) return 'km';
		if ( unit === TvUnit.FEET ) return 'ft';
		if ( unit === TvUnit.MILE ) return 'mile';
		if ( unit === TvUnit.METER_PER_SECOND ) return 'm/s';
		if ( unit === TvUnit.MILES_PER_HOUR ) return 'mph';
		if ( unit === TvUnit.KM_PER_HOUR ) return 'km/h';
		if ( unit === TvUnit.KG ) return 'kg';
		if ( unit === TvUnit.T ) return 't';
		if ( unit === TvUnit.PERCENT ) return '%';
		if ( unit === TvUnit.NONE ) return 'none';

		return 'none';
	}
}