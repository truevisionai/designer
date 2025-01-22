/*
 * Copyright Truesense AI Solutions Pvt Ltd, All Rights Reserved.
 */

import { TvUtils } from '../models/tv-utils';
import { TvElevation } from './tv-elevation.model';

export class TvElevationProfile {

	private elevations: TvElevation[];

	constructor () {

		this.elevations = [];

	}

	getFirstElevation (): TvElevation {

		return this.elevations[ 0 ];

	}

	computeCoefficients ( length: number ): void {

		TvUtils.computeCoefficients( this.elevations, length );

	}

	getLastElevation (): TvElevation {

		return this.elevations[ this.elevations.length - 1 ];

	}

	getElevations (): TvElevation[] {

		return this.elevations;

	}

	getElevationCount (): number {

		return this.elevations.length;

	}

	createAndAddElevation ( s: number, a: number, b: number = 0, c: number = 0, d: number = 0 ): void {

		this.addElevation( new TvElevation( s, a, b, c, d ) );

	}

	addElevation ( elevation: TvElevation ): void {

		this.elevations.push( elevation );

		this.elevations.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

	}

	getElevationValue ( s: number ): number {

		const elevation = this.getElevationAt( s );

		if ( elevation == null ) return 0;

		return elevation.getValue( s );
	}

	getElevationAt ( s: number ): TvElevation {

		return TvUtils.checkIntervalArray( this.elevations, s );

	}

	removeElevation ( elevation: TvElevation ): void {

		const index = this.elevations.indexOf( elevation );

		if ( index > -1 ) {

			this.elevations.splice( index, 1 );

		}

		this.elevations.sort( ( a, b ) => a.s > b.s ? 1 : -1 );

		// TvUtils.computeCoefficients( this.elevation, this.length );

	}

	getSlopeAt ( s: number ): number {

		const elevation = this.getElevationAt( s );

		if ( elevation == null ) return 0;

		return elevation.getSlope( s );

	}

	clone (): TvElevationProfile {

		const profile = new TvElevationProfile();

		profile.elevations = this.elevations.map( elevation => elevation.clone( elevation.s ) );

		return profile;
	}

}
